# Trade Probability Analyzer

A simple browser-based app for analyzing trade performance and estimating probability outcomes.

## Features

- Upload a CSV file with trade data
- Analyze win rate, profit factor, and average trade result
- Estimate chance of profit and risk-of-loss events
- Run a Monte Carlo forecast for future trade sequences
- View sample trade data immediately

## CSV format

Use a file with columns similar to this:

```csv
date,symbol,side,entry_price,exit_price,pnl,return_pct,result
2024-01-02,AAPL,long,190.1,195.8,5.7,3.00,win
2024-01-03,MSFT,long,430.2,426.5,-3.7,-0.86,loss
```

## Run locally

Open `index.html` directly in a browser, or serve it with a local web server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## What the app calculates

- Total trades
- Win rate
- Profit factor
- Average trade return
- Chance of positive trades
- Chance of target hit based on chosen target profit %
- Chance of stop-loss hit based on chosen loss threshold
- Monte Carlo forecast for future trade outcomes

This is a lightweight analysis dashboard designed for quick decision support and educational use.
