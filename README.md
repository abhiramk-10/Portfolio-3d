# Abhiram K. Portfolio

Personal portfolio for `abhiramk.in`, built with React, Vite, Three.js, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production output is generated in `dist/`.

## Connect `abhiramk.in`

This repo includes `public/CNAME`, so the built site contains a `CNAME` file with:

```txt
abhiramk.in
```

For GitHub Pages, push the project to GitHub, enable Pages for the branch or GitHub Actions build, then add these DNS records at the domain registrar:

```txt
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   your-github-username.github.io
```

For Netlify or Vercel, deploy the Vite app and point `abhiramk.in` to the DNS records shown by that host.
