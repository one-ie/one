#!/bin/sh
cd src/content/book

pandoc \
  metadata.yaml \
  0.\ Introduction.md \
  1.Architecture.md \
  2.Foundation.md \
  3.1.\ Company\ Worksheet.md \
  3.Company.md \
  4.Market.md \
  5.Customers.md \
  6.Alignment.md \
  7.Attract.md \
  8.Hook.md \
  9.Gift.md \
  10.Identify.md \
  11.Convert.md \
  12.Engage.md \
  13.Sell.md \
  14.Nurture.md \
  15.Upsell.md \
  16.Educate.md \
  17.Share.md \
  18.Optimise.md \
  --resource-path=assets \
  --toc \
  --toc-depth=2 \
  --split-level=1 \
  --css=epub-style.css \
  --epub-cover-image=assets/Playbook.png \
  -o TheElevatePlaybook.epub

# Open the generated EPUB file
open TheElevatePlaybook.epub 