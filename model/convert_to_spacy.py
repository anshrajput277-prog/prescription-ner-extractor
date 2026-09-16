import json
import random
import spacy
from spacy.tokens import DocBin
from spacy.util import filter_spans

def load_jsonl(path):
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data.append(json.loads(line))
    return data


def convert(data, output_path, nlp):
    doc_bin = DocBin()
    skipped = 0
    for item in data:
        text = item["text"]
        entities = item["entities"]
        doc = nlp.make_doc(text)
        spans = []
        for start, end, label in entities:
            span = doc.char_span(start, end, label=label, alignment_mode="expand")
            if span is None:
                skipped += 1
                continue
            spans.append(span)
        spans = filter_spans(spans)
        doc.ents = spans
        doc_bin.add(doc)
    doc_bin.to_disk(output_path)
    print(f"Saved {len(data)} docs to {output_path} ({skipped} entity spans skipped due to bad alignment)")


def main():
    nlp = spacy.blank("en")
    data = load_jsonl("data/annotated/annotated_data.jsonl")

    random.seed(42)
    random.shuffle(data)

    split_idx = int(len(data) * 0.85)
    train_data = data[:split_idx]
    dev_data = data[split_idx:]

    convert(train_data, "data/annotated/train.spacy", nlp)
    convert(dev_data, "data/annotated/dev.spacy", nlp)
    print(f"Train: {len(train_data)} | Dev: {len(dev_data)}")


if __name__ == "__main__":
    main()