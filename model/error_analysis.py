import spacy
from spacy.tokens import DocBin

nlp = spacy.load("model/experiments/final_drop02/model-best")
gold_docs = list(DocBin().from_disk("data/annotated/test.spacy").get_docs(nlp.vocab))

for g in gold_docs:
    pred = nlp(g.text)
    gold = {(e.start_char, e.end_char, e.label_) for e in g.ents}
    p = {(e.start_char, e.end_char, e.label_) for e in pred.ents}
    if gold != p:
        print("TEXT:", g.text)
        for s, e, l in sorted(gold - p):
            print("   MISSED/WRONG:", l, repr(g.text[s:e]))
        for s, e, l in sorted(p - gold):
            print("   EXTRA/WRONG :", l, repr(g.text[s:e]))