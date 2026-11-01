# Notion Medium API

A small Express + TypeScript service that turns a Notion page into clean HTML, for example to paste or import a Notion draft into Medium. You send it a page ID and your Notion integration key, and it walks every block on the page (including nested children) and returns the HTML.

## Endpoints

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/health` | none | `{ "status": "OK" }` |
| `POST` | `/convert` | `{ "pageId": "<notion page id>", "notionKey": "<integration secret>" }` | the page as HTML, or `401` if `notionKey` is missing |

The integration key comes from the caller on each request, so the server doesn't store one. Share the Notion page with your integration first, or the API can't read it.

## Supported blocks

`src/index.ts` converts paragraphs, headings 1-3, bulleted and numbered lists (wrapped in `<ul>` / `<ol>`), code (with a `language-*` class), quotes, callouts, images with captions, videos, dividers, toggles, tables and column lists. Rich text keeps bold, italic, strikethrough, underline, inline code and links. Child blocks are fetched recursively.

## Getting started

Requires Node.js 18+.

```sh
npm install
npm run dev        # ts-node src/index.ts on http://localhost:3000
```

```sh
curl -X POST localhost:3000/convert \
  -H 'Content-Type: application/json' \
  -d '{"pageId":"<page-id>","notionKey":"<your-integration-secret>"}'
```

Production build:

```sh
npm run build      # tsc -> dist/
npm start          # node dist/index.js
```

Or with Docker:

```sh
docker build -t notion-medium-api .
docker run -p 3000:3000 notion-medium-api
```

`PORT` sets the port (default 3000). `.env` holds `PORT` and `NODE_ENV`.

## Notes

- A debugging middleware logs every request's headers and body, and `/convert` errors echo the request body back. Both include the caller's Notion key, so remove them before running this anywhere shared.
- `src/index.ts` has a Notion integration key left in a comment. It should be revoked in Notion and deleted from the code.
- `cors()` allows any origin, and `express-rate-limit` is installed but not applied yet.
- `node_modules/` and `dist/` are committed. They can be removed and added to a `.gitignore`.

## Tech stack

- Node.js 18, Express 4, TypeScript 5
- `@notionhq/client`
