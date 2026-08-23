# backend — Mustafa

FastAPI + SQLite. Auth, veri modeli, rapor upload/analiz akışı,
`ai-doc-analysis` ve (yakında) `ai-scoring` entegrasyonu.

## Kurulum

```bash
pip install -r requirements.txt
cp .env.example .env   # JWT_SECRET_KEY'e rastgele bir deger gir
python -m pytest tests/ -v
uvicorn main:app --reload
```

## JWT_SECRET_KEY hakkında

`app/auth.py`, JWT imzalama anahtarını `JWT_SECRET_KEY` ortam
değişkeninden (ya da `backend/.env` dosyasından) okur. Ayarlanmazsa
geliştirme için sabit bir değere geri döner ve bir `RuntimeWarning`
basar — **bu sabit değer public repoda duruyor, gerçek/demo kullanımda
mutlaka kendi anahtarını ayarla:**

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Çıktıyı `.env` dosyasındaki `JWT_SECRET_KEY=` satırına yapıştır.
`.env` zaten `.gitignore`'da, commit'lenmez.
