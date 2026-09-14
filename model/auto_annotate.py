import re
import json
import glob
import os

def annotate_line(line):
    line = line.strip()
    if not line:
        return None
    entities = []

    # DOSAGE: number + unit (mg, mcg, ml, IU, g)
    dosage_match = re.search(r'\b\d+(\.\d+)?\s?(mg|mcg|ml|IU|g)\b', line, re.IGNORECASE)
    dosage_span = None
    if dosage_match:
        dosage_span = dosage_match.span()
        entities.append((dosage_span[0], dosage_span[1], "DOSAGE"))

    # FREQUENCY: common abbreviations
    freq_match = re.search(r'\b(OD|BD|TDS|QID|SOS|HS|OW)\b', line)
    if freq_match:
        entities.append((freq_match.start(), freq_match.end(), "FREQUENCY"))

    # DURATION: "x N days/weeks"
    duration_match = re.search(r'x\s\d+\s(days|weeks|day|week)', line, re.IGNORECASE)
    if duration_match:
        dur_text = duration_match.group()
        num_start = duration_match.start() + dur_text.index(re.search(r'\d', dur_text).group())
        entities.append((num_start, duration_match.end(), "DURATION"))

    # MEDICINE: text between the form (Tab./Cap./Syp.) and the dosage (or frequency if no dosage)
    form_match = re.match(r'(Tab\.|Cap\.|Syp\.)\s', line)
    med_start = form_match.end() if form_match else 0
    if dosage_span:
        med_end = dosage_span[0]
    elif freq_match:
        med_end = freq_match.start()
    else:
        med_end = len(line)
    med_text = line[med_start:med_end].strip()
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

    # print first 5 as a sanity check
    for text, ann in all_results[:5]:
        print("\n" + text)
        for start, end, label in ann["entities"]:
            print(f"   {label}: '{text[start:end]}'")


if __name__ == "__main__":
    main()