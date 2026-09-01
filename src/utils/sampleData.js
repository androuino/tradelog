// High-quality SVG chart data URLs for sample trading screenshots
const generateChartSvg = (title, type = 'bullish', symbol = 'EUR/USD') => {
  const bg = '#0f172a';
  const grid = '#1e293b';
  const green = '#10b981';
  const red = '#f43f5e';
  const line = type === 'bullish' ? green : red;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="${bg}"/>
    <g stroke="${grid}" stroke-width="1" opacity="0.4">
      <line x1="0" y1="90" x2="800" y2="90"/>
      <line x1="0" y1="180" x2="800" y2="180"/>
      <line x1="0" y1="270" x2="800" y2="270"/>
      <line x1="0" y1="360" x2="800" y2="360"/>
      <line x1="160" y1="0" x2="160" y2="450"/>
      <line x1="320" y1="0" x2="320" y2="450"/>
      <line x1="480" y1="0" x2="480" y2="450"/>
      <line x1="640" y1="0" x2="640" y2="450"/>
    </g>
    <!-- Header -->
    <text x="30" y="45" fill="#f8fafc" font-family="sans-serif" font-size="20" font-weight="bold">${symbol} • 15m</text>
    <text x="30" y="70" fill="#94a3b8" font-family="sans-serif" font-size="14">${title}</text>
    
    <!-- Candlesticks / Price action graph -->
    <path d="${type === 'bullish' ? 'M 60 320 Q 180 300 280 220 T 500 180 T 740 80' : 'M 60 120 Q 200 140 320 240 T 520 280 T 740 380'}" fill="none" stroke="${line}" stroke-width="3"/>
    
    <!-- Order Block / Zone -->
    <rect x="240" y="${type === 'bullish' ? '200' : '120'}" width="160" height="70" rx="6" fill="${line}" fill-opacity="0.15" stroke="${line}" stroke-dasharray="4"/>
    <text x="250" y="${type === 'bullish' ? '240' : '160'}" fill="${line}" font-family="sans-serif" font-size="12" font-weight="bold">ENTRY ZONE</text>
    
    <!-- Watermark / Indicator -->
    <text x="750" y="420" fill="#475569" font-family="sans-serif" font-size="12" text-anchor="end">Trading Journal Setup Chart</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const sampleEntries = [
  {
    id: 'entry-1',
    date: new Date(Date.now() - 86400000 * 0).toISOString().split('T')[0], // Today
    session: 'London / NY Overlap',
    pnl: 580.00,
    pnlPercentage: 2.90,
    result: 'win',
    tradesCount: 2,
    winsCount: 2,
    lossesCount: 0,
    
    // Multiple Individual Trades
    trades: [
      {
        id: 'tr-1',
        asset: 'EUR/USD',
        direction: 'LONG',
        pnl: 350.00,
        pnlPercentage: 1.75,
        strategy: '15m Order Block Retest',
        entryPrice: '1.08450',
        exitPrice: '1.08800',
        rrRatio: '1:2.5',
        notes: 'Liquidity sweep of Asian low followed by bullish FVG retest.',
        imageUrl: generateChartSvg('15m Order Block Retest & Sweep', 'bullish', 'EUR/USD'),
        imageCaption: 'EUR/USD 15m Order Block setup'
      },
      {
        id: 'tr-2',
        asset: 'BTC/USD',
        direction: 'SHORT',
        pnl: 230.00,
        pnlPercentage: 1.15,
        strategy: 'Key Resistance Liquidity Hunt',
        entryPrice: '66,400',
        exitPrice: '65,700',
        rrRatio: '1:2.0',
        notes: 'Quick scalp short off $66.5k psychological barrier rejection.',
        imageUrl: generateChartSvg('BTC 15m Resistance Rejection', 'bearish', 'BTC/USD'),
        imageCaption: 'BTC/USD 15m Scalp Short'
      }
    ],
    
    // Core Questions
    planFollowed: 'yes',
    planRulesChecklist: [
      { id: 'rule-1', label: 'Waited for 15m Liquidity Sweep', checked: true },
      { id: 'rule-2', label: 'Risk capped at <= 1% per trade', checked: true },
      { id: 'rule-3', label: 'Stop Loss placed at technical invalidation', checked: true },
      { id: 'rule-4', label: 'Minimum 1:2 R:R Ratio', checked: true }
    ],
    
    mood: 'disciplined',
    mindsetScore: 5,
    
    emotionReflection: 'Felt very patient today. Managed two separate trades on EUR/USD and BTC without feeling overwhelmed. Waited for entry confirmations on both setups before clicking buy/sell.',
    
    // Self-Development Questions
    bestExecution: 'Did not jump into EUR/USD early; waited 45 mins for Asian low sweep to print cleanly.',
    mistakes: 'None major. Scaled out 50% on BTC a bit early, but profit target hit regardless.',
    keyLesson: 'Managing multiple uncorrelated assets (Forex + Crypto) works great when rules are mechanical.',
    disciplineScore: 5,
    
    images: [
      {
        id: 'img-1',
        url: generateChartSvg('15m Order Block Retest & Sweep', 'bullish', 'EUR/USD'),
        caption: 'EUR/USD 15m Order Block setup'
      },
      {
        id: 'img-2',
        url: generateChartSvg('BTC 15m Resistance Rejection', 'bearish', 'BTC/USD'),
        caption: 'BTC/USD 15m Scalp Short'
      }
    ]
  },
  {
    id: 'entry-2',
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // Yesterday
    session: 'New York',
    pnl: 140.00,
    pnlPercentage: 0.70,
    result: 'win',
    tradesCount: 2,
    winsCount: 1,
    lossesCount: 1,
    
    trades: [
      {
        id: 'tr-3',
        asset: 'NVDA',
        direction: 'LONG',
        pnl: 420.00,
        pnlPercentage: 2.10,
        strategy: 'Pre-Market Opening Range Breakout',
        entryPrice: '128.50',
        exitPrice: '132.70',
        rrRatio: '1:3.0',
        notes: 'Strong earnings catalyst gap up and hold above 9:45 AM high.',
        imageUrl: generateChartSvg('NVDA Pre-Market ORB Breakout', 'bullish', 'NVDA'),
        imageCaption: 'NVDA Opening Range Breakout'
      },
      {
        id: 'tr-4',
        asset: 'GBP/USD',
        direction: 'SHORT',
        pnl: -280.00,
        pnlPercentage: -1.40,
        strategy: 'Trend Reversal',
        entryPrice: '1.2750',
        exitPrice: '1.2780',
        rrRatio: '1:1.5',
        notes: 'Tried to short against strong US dollar weakness news spike.',
        imageUrl: generateChartSvg('GBP/USD Spike Invalidation', 'bearish', 'GBP/USD'),
        imageCaption: 'GBP/USD news spike stop out'
      }
    ],
    
    planFollowed: 'partial',
    planRulesChecklist: [
      { id: 'rule-1', label: 'Waited for 15m Liquidity Sweep', checked: true },
      { id: 'rule-2', label: 'Risk capped at <= 1% per trade', checked: true },
      { id: 'rule-3', label: 'Stop Loss placed at technical invalidation', checked: true },
      { id: 'rule-4', label: 'Minimum 1:2 R:R Ratio', checked: false }
    ],
    
    mood: 'calm',
    mindsetScore: 4,
    
    emotionReflection: 'NVDA trade was executed flawlessly. The GBP/USD short was slightly rushed into red news. Overall finished day green because win size exceeded loss.',
    
    bestExecution: 'Riding NVDA runner position to final profit target.',
    mistakes: 'Shorting GBP/USD during high-impact red folder news event.',
    keyLesson: 'Check red-folder economic calendar before opening forex trades.',
    disciplineScore: 4,
    
    images: [
      {
        id: 'img-3',
        url: generateChartSvg('NVDA Pre-Market ORB Breakout', 'bullish', 'NVDA'),
        caption: 'NVDA Opening Range Breakout'
      }
    ]
  },
  {
    id: 'entry-3',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
    session: 'New York',
    pnl: -220.00,
    pnlPercentage: -1.10,
    result: 'loss',
    tradesCount: 2,
    winsCount: 0,
    lossesCount: 2,
    
    trades: [
      {
        id: 'tr-5',
        asset: 'NQ (Nasdaq)',
        direction: 'LONG',
        pnl: -150.00,
        pnlPercentage: -0.75,
        strategy: '1m FVG Retest',
        notes: 'Entered long after minor pullback, but market broke lower to sweep liquidity.',
        imageUrl: generateChartSvg('NQ 1m FVG Retest Invalidation', 'bearish', 'NQ Futures'),
        imageCaption: 'NQ Stop loss hit on 1m FVG'
      },
      {
        id: 'tr-6',
        asset: 'ETH/USD',
        direction: 'LONG',
        pnl: -70.00,
        pnlPercentage: -0.35,
        strategy: 'Support Bounce',
        notes: 'Entered small position on Ethereum, stopped out during market chop.',
        imageUrl: null
      }
    ],
    
    planFollowed: 'no',
    planRulesChecklist: [
      { id: 'rule-1', label: 'Waited for 15m Liquidity Sweep', checked: false },
      { id: 'rule-2', label: 'Risk capped at <= 1% per trade', checked: true },
      { id: 'rule-3', label: 'Stop Loss placed at technical invalidation', checked: true }
    ],
    
    mood: 'impatient',
    mindsetScore: 2,
    
    emotionReflection: 'Was feeling restless before market open. Traded low-timeframe 1m noise instead of waiting for 15m structure.',
    
    bestExecution: 'Respected stop losses on both trades without moving them wider.',
    mistakes: 'Impatience and trading 1m noise instead of higher timeframe confluence.',
    keyLesson: '15m timeframe or higher only. 1m noise creates unnecessary paper cuts.',
    disciplineScore: 3,
    
    images: [
      {
        id: 'img-5',
        url: generateChartSvg('NQ 1m FVG Retest Invalidation', 'bearish', 'NQ Futures'),
        caption: 'NQ Stop loss hit on 1m FVG'
      }
    ]
  }
];

export const sampleLessons = [
  {
    id: 'lesson-1',
    title: 'Thinking in Probabilities & Accepting Risk',
    bookTitle: 'Trading in the Zone',
    author: 'Mark Douglas',
    category: 'Mindset',
    quote: 'When you truly accept the risk, you will be at peace with any outcome.',
    takeaway: 'Every trade outcome is independent and probabilistic. My job is not to guess or force a win on a single trade, but to execute my edge flawlessly over a series of 100 trades.',
    date: '2026-08-20',
    isFavorite: true
  },
  {
    id: 'lesson-2',
    title: 'Systems Over Goals (1% Marginal Gains)',
    bookTitle: 'Atomic Habits',
    author: 'James Clear',
    category: 'Habits',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    takeaway: 'Instead of obsessing over daily P/L goals, focus on buildable systems: pre-market routine, rules checklist, and post-market journaling. Great habits compound into consistent performance.',
    date: '2026-08-22',
    isFavorite: true
  },
  {
    id: 'lesson-3',
    title: 'Room for Error & Margin of Safety',
    bookTitle: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Risk & Money',
    quote: 'Plan on your plan not going according to plan.',
    takeaway: 'Position size conservatively so that a string of 5 consecutive losses has zero impact on operational or mental capital. Margin of safety gives you longevity in financial markets.',
    date: '2026-08-25',
    isFavorite: false
  },
  {
    id: 'lesson-4',
    title: 'Dichotomy of Control in Execution',
    bookTitle: 'The Daily Stoic',
    author: 'Ryan Holiday / Epictetus',
    category: 'Psychology',
    quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    takeaway: 'I cannot control price movement or market noise after clicking buy/sell. I can only control my risk allocation, entry criteria, stop discipline, and emotional composure.',
    date: '2026-08-28',
    isFavorite: true
  }
];
