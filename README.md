# krestiki-github

Статическая игра «Крестики-нолики» на чистом HTML/CSS/JS.

## Возможности

- Режимы: игрок против игрока и игрок против бота
- Проверка победы/ничьи, подсветка выигрышной линии
- Счётчик статистики с сохранением в `localStorage`
- Переключение тёмной/светлой темы с сохранением
- Адаптивный интерфейс и управление с клавиатуры
- PWA: офлайн-работа через service worker и `manifest.json`

## Локальный запуск

Откройте `/home/runner/work/krestiki-github/krestiki-github/index.html` в браузере  
или поднимите статический сервер в корне репозитория:

```bash
python3 -m http.server 8000
```

Затем откройте `http://localhost:8000`.

## Деплой на static hosting

Проект можно выкладывать как обычный статический сайт:

- GitHub Pages
- Netlify
- Vercel (static output)

## GitHub Pages URL

После включения GitHub Pages проект будет доступен по адресу:

https://alexeu00999.github.io/krestiki-github/
