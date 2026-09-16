import spacy

nlp = spacy.load("trained_model/model-best")

# None of these exact lines (or drug names) appear in the original 4 raw
# training files. They cover: unseen generics, glued name+dose+freq+duration
# (no spaces), Hindi-English mixing, IV/route mentions, "stat"/"SOS" dosing,
# and a couple of near-miss brand names that are similar-but-not-identical
# to ones in the gazetteer (to check it isn't just doing exact string match).
TEST_LINES = [
    "Cap Escitalopram 10mg 1-0-0 x 30 days",
    "Tab Sertraline 50mg OD x 45 days",
    "Inj Ceftriaxone 1g IV BD x 3 days",
    "T. Rivaroxaban 20mg 1-0-0 pc x 3 months",
    "Cap Ranitidine 150mg 1-1 x 10 din",
    "Duloxetine 30mg cap OD hs x 2 months",
    "Tab.Empagliflozin10mg1-0-0x30d",
    "syp Zincoferol 5ml bd x 7 days",
    "Montek FX tab 0-0-1 x 14 days",
    "Tab. Empagliflozin 25 mg 1 goli subah x 1 mahina",
    "Cap Dapagliflozin 10mg OD before breakfast x 90 days",
    "T Prednisolone 20mg 1-0-0 tapering x 5 days",
    "Tb.Esomeprazole40mgODx14d",
    "Ivabradine 5mg BD x 1 month",
    "Cap. Rifaximin 550mg 1-0-1 x 14 days",
    "Ondansetron 4mg IV stat",
    "Loperamide 2mg SOS for loose motions x 3 days",
    "Tab Vonoprazan 20mg 1-0-0 x 4 weeks",
    "Metoclopramide 10mg TDS ac x 5 days",
    "Cap. Teneligliptin 20mg OD x 1 month",
]

correct_count = 0
total = len(TEST_LINES)

for line in TEST_LINES:
    doc = nlp(line)
    ents = [(ent.text, ent.label_) for ent in doc.ents]
    labels_found = set(lab for _, lab in ents)
    has_medicine = "MEDICINE" in labels_found
    marker = "OK " if has_medicine else "!! "
    if has_medicine:
        correct_count += 1
    print(f"{marker}{line}")
    print(f"     -> {ents}\n")

print(f"MEDICINE was detected in {correct_count}/{total} lines.")
print("(This only checks whether a MEDICINE span was found at all — you still")
print(" need to eyeball whether DOSAGE/FREQUENCY/DURATION spans look right,")
print(" and whether the MEDICINE span is the correct word, not just *a* word.)")