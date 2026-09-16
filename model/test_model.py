import spacy
nlp = spacy.load("trained_model/model-best")

for text in [
    "Tab Pantoprazole 40mg 1-0-0 x 10 days",
    "Rosuvastatin 10mg tab OD x 30 days",
    "Cap Rabeprazole 20mg 1-0-1 x 5 days",
]:
    doc = nlp(text)
    print(text, "->", [(e.text, e.label_) for e in doc.ents])