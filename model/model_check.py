import spacy
from spacy.tokens import DocBin
from collections import Counter

nlp = spacy.blank("en")

def load(path):
    return list(DocBin().from_disk(path).get_docs(nlp.vocab))

train = load("data/annotated/train.spacy")
dev = load("data/annotated/dev.spacy")

for name, docs in [("train", train), ("dev", dev)]:
    c = Counter(e.label_ for d in docs for e in d.ents)
    print(name, "docs:", len(docs), "unique texts:", len({d.text for d in docs}), "entities:", dict(c))

tr = {d.text for d in train}
overlap = [d.text for d in dev if d.text in tr]
print("dev texts also in train:", len(overlap), "of", len(dev))

tr_ents = {(e.text.lower(), e.label_) for d in train for e in d.ents}
dev_ents = [(e.text.lower(), e.label_) for d in dev for e in d.ents]
seen = sum(1 for x in dev_ents if x in tr_ents)
print("dev entities already seen in train:", seen, "of", len(dev_ents))

print("sample train texts:")
for d in train[:3]:
    print("  ", d.text)