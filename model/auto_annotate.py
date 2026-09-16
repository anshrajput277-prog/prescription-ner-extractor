import re
import json
import glob
import os

# ---------------------------------------------------------------------------
# Gazetteer of drug names (generic + common Indian brand names) seen in this
# corpus. Matching against a known-name list is far more reliable than trying
# to guess "everything before the dosage" with positional heuristics, because
# this data mixes brand names, generics, Hindi-English code-switching, and
# name+dose glued together with no space (e.g. "Amox250mg").
# Sorted longest-first so multi-word / longer brand names win over substrings
# (e.g. "Amoxyclav" before "Amox", "Vitamin D3" before "Vit D").
# ---------------------------------------------------------------------------
DRUG_NAMES = sorted({
    # antibiotics
    "amoxicillin", "amoxyclav", "amoxiclav", "amoxclav", "moxikind-cv", "moxikind",
    "amox", "mox", "augmentin", "azithromycin", "azithral", "azithro", "azee",
    "cefpodoxime", "oflox", "ofloxacin", "cefixime", "zifi", "levofloxacin", "levo",
    "clindamycin", "clinda", "doxycycline", "doxy", "metronidazole", "metrogyl",
    "ampicillin", "cephadex", "cefadroxil", "norfloxacin", "norflox", "tetracycline",
    "tetra", "roxithromycin", "roxi", "ampiclox", "clarithromycin", "clari",
    "clarithro", "linezolid", "cotrimoxazole", "nitrofurantoin", "rifampicin",
    "gatifloxacin", "gati", "cefuroxime", "fluclox", "flucloxacillin", "ciplox",
    "cipro", "ciprofloxacin", "cifran", "taximo", "ciplox-500", "cephadroxil",

    # chronic / cardio-metabolic
    "losartan", "sitagliptin", "metformin", "mtfrmn", "mtf", "glycomet",
    "amlodipine", "amlodac", "amlo", "atorvastatin", "atorva", "calcium",
    "glimepiride", "cholecalciferol", "telmisartan", "telma", "pantoprazole",
    "pantocid", "pantodac", "pan-d", "pand", "pan", "rabicip", "metoprolol",
    "rosuvastatin", "vitamin d3", "vitamin d", "vit d3", "vit-d3", "vit-d",
    "vit d", "vitd3", "vitd",

    # fever / pain / NSAIDs
    "paracetamol", "pcm", "dolo", "crocin", "calpol", "para", "ibuprofen",
    "ibrofen", "brufen", "combiflam", "diclofenac", "voveran", "aceclofenac",
    "zerodol-p", "zerodol", "nimesulide", "aspirin", "meftal-spas", "meftal",
    "naproxen", "ketorolac", "sumo", "etoricoxib", "etodolac", "ultracet",
    "flexon mr", "flexon", "mefenamic acid", "omeprazole", "monocef", "ceftum",
    "eltroxin", "thyronorm", "domstal", "ondem", "zincovit", "neurobion forte",
    "neurobion", "shelcal", "supradyn", "folvite", "orofer xt", "orofer",
    "dexorange", "chymoral forte", "chymoral", "enzomac", "deflazacort",
    "omnacortil", "wysolone", "atarax", "ibugesic plus", "ibugesic",
    "colicaid", "t-bact", "fusidic acid", "calamine", "sporlac ds", "sporlac",
    "econorm", "ors", "digene", "mucaine", "ibu",

    # cough / cold / allergy
    "cetirizine", "cetzine", "zyrtec", "citrizine", "okacet", "levocetirizine",
    "levocet", "ascoril-ls", "ascoril ls", "ascoril", "benadryl dr", "benadryl",
    "montair-lc", "montair lc", "montair fx", "montair", "montek lc",
    "montek", "montelukast", "alex", "allegra", "alegra", "fexofenadine",
    "grilinctus", "chlorpheniramine", "cpm", "corex", "chericof plus",
    "chericof", "tussin", "tossex", "phensedyl", "avil", "sinarest-af",
    "sinarest af", "sinarest", "desloratadine", "koflet", "hydroxyzine",
    "solvin", "rhinocap", "cofsils", "wikoryl", "torex", "levolin",
    "bro-zedex", "zedex", "cofdex", "actifed", "cheston cold", "pyrimon",
    "mucolite",
} | {
    # a few extra glued-name variants that appear without space before number
    "taxim-o", "amoxyclav-375mg".rstrip("-375mg"),
}, key=len, reverse=True)

DRUG_ALT = "|".join(re.escape(d) for d in DRUG_NAMES if d)
# Note: end boundary allows a digit right after the name (e.g. "Amox250mg",
# "Pcm500mg") since brand+dose are frequently glued together with no space.
DRUG_PATTERN = re.compile(
    r'(?<![A-Za-z])(' + DRUG_ALT + r')(?=[\d\W]|$)', re.IGNORECASE
)

LEADING_NOISE = re.compile(
    r'^\s*(Pt\s+advised|Rx:?|Advised(\s+pt)?(\s+to\s+start)?|Start|'
    r'Continue(\s+ongoing\s+Rx:?)?|Take|Tx:?|'
    r'Tab(let)?\.?|Tb\.?|T\.|Cap(sule)?\.?|C\.|Syp\.?|Syr(up)?\.?|Inj\.?|'
    r'Drops?|Oint\.?|Cream|Lotion)\s*',
    re.IGNORECASE
)

# NOTE on boundaries: this data frequently glues fields together with no
# separator (e.g. "500mg1-1-1x3d" = DOSAGE + FREQUENCY + DURATION back to
# back). A plain trailing \b fails there because both sides are "word"
# characters. So each pattern below uses (?<![A-Za-z]) / (?![A-Za-z]) at its
# edges instead: it still won't match inside another word, but it tolerates a
# digit sitting immediately on either side.
FREQ_PATTERN = re.compile(
    r'(?<![A-Za-z])('
    r'o\.?d\.?|b\.?i\.?d\.?|t\.?i\.?d\.?|q\.?i\.?d\.?|q\.?d\.?|q\.?a\.?m\.?|'
    r'tds|bd|hs|sos|ow|po\s+(od|bid|tid|qid)|'
    r'once\s+(a|per)\s+(day|week)|twice\s+(a|per)\s+day|thrice\s+(a|per)\s+day|'
    r'\d+\s+times\s+a\s+day|'
    r'\d(-\d){2,3}'          # 1-0-1 / 1-1-1-1 / 0-0-1 dosing schedules
    r')(?![A-Za-z])',
    re.IGNORECASE
)

DOSAGE_PATTERN = re.compile(
    r'(?<![\d.])\d+(?:,\d{3})*(?:\.\d+)?\s?[kK]?\s?(mg|mcg|ml|iu|units?|g|gm|%)(?![A-Za-z])',
    re.IGNORECASE
)

DURATION_PATTERN = re.compile(
    r'(?<![A-Za-z])x?\.?\s?\d+(?:\.\d+)?\s?(?:/\s?\d+)?\s?'
    r'(days?|d(?![A-Za-z])|weeks?|wks?|w(?![A-Za-z])|months?|mo(?![A-Za-z])|din|hafte|mahina)',
    re.IGNORECASE
)


def annotate_line(line):
    line = line.rstrip('\n')
    if not line.strip():
        return None
    entities = []

    dosage_match = DOSAGE_PATTERN.search(line)
    dosage_span = None
    if dosage_match:
        dosage_span = dosage_match.span()
        entities.append((dosage_span[0], dosage_span[1], "DOSAGE"))

    freq_match = FREQ_PATTERN.search(line)
    if freq_match:
        entities.append((freq_match.start(), freq_match.end(), "FREQUENCY"))

    search_start = dosage_span[1] if dosage_span else 0
    dur_match = DURATION_PATTERN.search(line, search_start)
    if dur_match:
        entities.append((dur_match.start(), dur_match.end(), "DURATION"))

    # --- MEDICINE: prefer a gazetteer hit; fall back to positional heuristic ---
    drug_match = DRUG_PATTERN.search(line)
    if drug_match:
        entities.append((drug_match.start(), drug_match.end(), "MEDICINE"))
    else:
        stripped = line
        offset = 0
        while True:
            m = LEADING_NOISE.match(stripped)
            if not m or m.end() == 0:
                break
            stripped = stripped[m.end():]
            offset += m.end()
        med_start = offset
        later_starts = [s for s, e, lab in entities if s >= med_start]
        med_end = min(later_starts) if later_starts else len(line)
        med_text = line[med_start:med_end].strip(' .-')
        if med_text:
            actual_start = line.index(med_text, med_start)
            actual_end = actual_start + len(med_text)
            entities.append((actual_start, actual_end, "MEDICINE"))

    entities.sort(key=lambda e: e[0])
    return (line, {"entities": entities})


def main():
    os.makedirs("data/annotated", exist_ok=True)
    input_files = glob.glob("data/raw/*.txt")
    all_results = []

    for filepath in input_files:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                ann = annotate_line(line)
                if ann:
                    all_results.append(ann)

    output_path = "data/annotated/annotated_data.jsonl"
    with open(output_path, "w", encoding="utf-8") as f:
        for text, ann in all_results:
            f.write(json.dumps({"text": text, "entities": ann["entities"]}) + "\n")

    print(f"Annotated {len(all_results)} lines from {len(input_files)} files.")
    print(f"Saved to {output_path}")

    for text, ann in all_results[:8]:
        print("\n" + text)
        for start, end, label in ann["entities"]:
            print(f"   {label}: '{text[start:end]}'")


if __name__ == "__main__":
    main()
