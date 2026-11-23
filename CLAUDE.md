# Hinweise für Claude (und andere Entwickler)

> **Arbeitsbereich: ausschließlich das Repository `ke-ngineering/adventsbackstube`.**
> Der Auftraggeber hat weitere Projekte auf GitHub. Diese niemals lesen, klonen, ändern, durchsuchen oder
> Commits/Issues/Pull Requests darin anlegen – auch nicht „nur kurz zum Nachschauen“. Wird für eine Aufgabe ein
> anderes Repository nötig, zuerst ausdrücklich beim Auftraggeber nachfragen.

1. **Zuerst `docs/PROJEKT.md` lesen** – dort stehen Vision, Entscheidungen, Agenda, Status und offene Fragen.
2. Mit dem Auftraggeber auf **Deutsch** kommunizieren; er ist kein Spieleentwickler – Entscheidungen gemeinsam treffen, Optionen kurz erklären.
3. Nach jeder Sitzung `docs/PROJEKT.md` aktualisieren (Decision Log, Agenda-Status, offene Fragen) und committen.
4. Das Spiel ist eine Single-Page-Web-App (`index.html`), mobil zuerst (Testbreite 390 px), Hell- und Dunkelmodus.
5. Stil: gemütlich-warm, verspielt (siehe Entscheidung D6). Keine Emojis als Spielgrafik.
6. Neue Level-Generatoren müssen garantiert lösbare Level liefern (Solver oder Rückwärts-Generierung).
7. **Öffentliches Repo, strikt anonym:** keine Namen oder persönlichen Daten in Code, Doku, Commit-Nachrichten. Commits als `Claude <noreply@anthropic.com>`. Persönliches nur verschlüsselt (siehe PROJEKT.md, Abschnitt 4).
8. **Änderungen nur per Pull Request:** `main` ist geschützt. Für jede Änderung einen Zweig anlegen, pushen und einen PR öffnen (`gh api repos/ke-ngineering/adventsbackstube/pulls -f title=… -f head=<zweig> -f base=main -f body=…`). Der Auftraggeber prüft und klickt „Merge“. Erst danach ist die Änderung live (GitHub Pages baut von `main`).
9. Spielstand-Format abwärtskompatibel halten – sie spielt ab 1.12. mit echtem Fortschritt.
