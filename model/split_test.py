import random
import spacy
from spacy.tokens import DocBin

nlp = spacy.blank("en")
docs = list(DocBin().from_disk("data/annotated/train.spacy").get_docs(nlp.vocab))

random.seed(42)
random.shuffle(docs)
test, train_final = docs[:50], docs[50:]

DocBin(docs=test).to_disk("data/annotated/test.spacy")
DocBin(docs=train_final).to_disk("data/annotated/train_final.spacy")

tr_ents = {(e.text.lower(), e.label_) for d in train_final for e in d.ents}
te_ents = [(e.text.lower(), e.label_) for d in test for e in d.ents]
print("train_final docs:", len(train_final), "test docs:", len(test), "test entities:", len(te_ents))
for lab in ["MEDICINE", "DOSAGE", "FREQUENCY", "DURATION"]:
    items = [x for x in te_ents if x[1] == lab]
    unseen = [x for x in items if x not in tr_ents]
    print(lab, "test:", len(items), "unseen in train_final:", len(unseen))