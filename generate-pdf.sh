#!/bin/sh
cd src/content/book

# Warn if book-level metadata is found in chapter frontmatter
for file in *.md; do
  if [ "$file" = "metadata.yaml" ]; then continue; fi
  if grep -qE '^---' "$file"; then
    if grep -qE '^(author|publisher|rights|identifier|bookFormat):' "$file"; then
      echo "\033[0;33mWARNING: Book-level metadata found in $file. Only metadata.yaml will be used for PDF metadata.\033[0m"
    fi
  fi
done

# Generate PDF with Pandoc (using XeLaTeX)
pandoc \
  --metadata-file=metadata.yaml \
  --metadata=title:"The Elevate Playbook" \
  0.Introduction.md \
  1.Architecture.md \
  2.Foundation.md \
  3.0.Company.md \
  '3.1.Company Worksheet.md' \
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
  --pdf-engine=xelatex \
  --output=TheElevatePlaybook.pdf

# Open the generated PDF file
open TheElevatePlaybook.pdf 