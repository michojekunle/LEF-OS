// Single source of truth — all 111 study days, 4 months, 3 domains.
// Calendar spans 122 days (Jun 1 – Sep 30, 2026); curriculum content covers 111 numbered days.
// Days 112–122 are integration & public-sharing buffer.

export type Domain = 'law' | 'economics' | 'finance';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Synthesis';

export type Day = {
  day: number;
  topic: string;
  isReview: boolean;
};

export type Week = {
  weekNumber: number;
  title: string;
  days: Day[];
};

export type DomainTrack = {
  domain: Domain;
  level: Level;
  theme: string;
  focus: string;
  weeks: Week[];
  resources: string[];
  contentIdeas: string[];
};

export type MonthCurriculum = {
  month: 1 | 2 | 3 | 4;
  name: string;
  monthName: string;
  theme: string;
  dateRange: string;
  startDay: number;
  endDay: number;
  tracks: {
    law: DomainTrack;
    economics: DomainTrack;
    finance: DomainTrack;
  };
};

const r = (day: number, topic: string): Day => ({ day, topic, isReview: true });
const d = (day: number, topic: string): Day => ({ day, topic, isReview: false });

// ─────────────────────────────────────────────────────────────────────────────
// MONTH 1 — Foundations & Frameworks (June 1–30)
// ─────────────────────────────────────────────────────────────────────────────

const month1Law: DomainTrack = {
  domain: 'law',
  level: 'Beginner',
  theme: 'The Architecture of Law',
  focus: 'What law is, where it comes from, and how it governs you as a person and founder.',
  weeks: [
    {
      weekNumber: 1,
      title: 'What Is Law? Sources & Systems',
      days: [
        d(1, 'What is law? Natural law vs. positive law vs. customary law'),
        d(2, 'Sources of Nigerian law — Constitution, statutes, common law, equity'),
        d(3, "Nigeria's legal system — Federal vs. State jurisdiction"),
        d(4, '1999 Constitution (as amended) — key chapters every Nigerian must know'),
        d(5, 'Fundamental human rights (Chapter IV) — your rights as an individual'),
        d(6, 'Customary law & Sharia law — how they coexist in Nigeria'),
        r(7, "WEEKLY REVIEW — How does Nigeria's legal pluralism affect founders?"),
      ],
    },
    {
      weekNumber: 2,
      title: 'Contract Law — The Backbone of Business',
      days: [
        d(8, 'What makes a valid contract? Offer, acceptance, consideration'),
        d(9, 'Capacity to contract — who can and cannot contract in Nigeria'),
        d(10, 'Types of contracts — written, oral, implied'),
        d(11, 'Breach of contract — consequences and remedies'),
        d(12, 'Exclusion clauses, penalties, and liquidated damages'),
        d(13, 'Common contract mistakes founders make (NDAs, service agreements)'),
        r(14, 'WEEKLY REVIEW — Draft a 1-page simple service contract outline'),
      ],
    },
    {
      weekNumber: 3,
      title: 'Business Law in Nigeria',
      days: [
        d(15, 'CAMA 2020 — registering a business in Nigeria (sole trader, LLC, PLC)'),
        d(16, 'Differences: Business name vs. Limited Liability Company'),
        d(17, "Directors' duties and liabilities under CAMA"),
        d(18, 'Intellectual property basics — trademarks, copyright, patents in Nigeria'),
        d(19, 'Employment law basics — contracts of employment, dismissal rights'),
        d(20, 'Consumer protection laws in Nigeria (FCCPC, Consumer Protection Council Act)'),
        r(21, 'WEEKLY REVIEW — 3 legal mistakes Nigerian startups make and how to avoid them'),
      ],
    },
    {
      weekNumber: 4,
      title: 'Taxation & Regulatory Law',
      days: [
        d(22, 'Nigerian tax law overview — FIRS, LIRS, WHT, VAT'),
        d(23, 'Personal income tax vs. corporate income tax'),
        d(24, 'VAT in Nigeria — what businesses must know'),
        d(25, 'Regulatory bodies: CAC, SEC, CBN, NCC, NITDA'),
        d(26, 'Data protection law — Nigeria Data Protection Act 2023 (NDPA)'),
        d(27, 'Fintech-specific regulation — CBN licensing frameworks'),
        r(28, 'WEEKLY REVIEW — Regulatory compliance checklist for a Nigerian tech startup'),
      ],
    },
  ],
  resources: [
    '1999 Constitution of Nigeria',
    'CAMA 2020 (CAC website)',
    'Nigeria Data Protection Act 2023',
    "Afe Babalola's Nigerian Law of Contract",
    'Lawyard.ng',
    'SPA Ajibade & Co legal insights',
  ],
  contentIdeas: [
    "Thread: 'The 5 Nigerian laws every founder must know'",
    'Tweet: explain CAMA 2020 in 2 sentences',
    'Short video: what NDPA means for your startup',
  ],
};

const month1Econ: DomainTrack = {
  domain: 'economics',
  level: 'Beginner',
  theme: 'Economic Thinking 101',
  focus: 'Core economic principles and how they explain the world around you.',
  weeks: [
    {
      weekNumber: 1,
      title: 'What Is Economics? Scarcity & Choice',
      days: [
        d(1, 'What economics actually is — micro vs. macro distinction'),
        d(2, 'Scarcity, opportunity cost, and trade-offs'),
        d(3, 'Demand and supply — the most powerful mental model in economics'),
        d(4, 'Price mechanism — how markets coordinate'),
        d(5, 'Elasticity — why some prices matter more than others'),
        d(6, 'Market structures — perfect competition, monopoly, oligopoly'),
        r(7, 'WEEKLY REVIEW — Apply demand/supply to a Nigerian market (fuel, food)'),
      ],
    },
    {
      weekNumber: 2,
      title: 'Macroeconomics Foundations',
      days: [
        d(8, 'GDP — what it measures and what it misses'),
        d(9, 'Inflation — causes, types, effects on everyday life'),
        d(10, 'Unemployment — types, causes, and the African context'),
        d(11, 'Fiscal policy — how governments spend and tax to manage economies'),
        d(12, 'Monetary policy — how central banks control money supply'),
        d(13, 'Exchange rates — why naira devaluation matters to your business'),
        r(14, "WEEKLY REVIEW — Explain the CBN's monetary policy in plain language"),
      ],
    },
    {
      weekNumber: 3,
      title: 'Nigerian Economy — Structure & History',
      days: [
        d(15, "Structure of Nigeria's economy — oil dependence, agriculture, services"),
        d(16, "History of Nigeria's economic policy (SAP, Vision 2010, Tinubu reforms)"),
        d(17, "The informal economy — why 90% of Nigeria's workers are in it"),
        d(18, "Nigeria's fiscal federalism — oil revenue, FAAC, and state finances"),
        d(19, 'Poverty, inequality, and the Gini coefficient in Nigeria'),
        d(20, "Nigeria's debt profile — domestic vs. external debt"),
        r(21, "WEEKLY REVIEW — 'Why Nigeria has growth without development'"),
      ],
    },
    {
      weekNumber: 4,
      title: 'African Economic Landscape',
      days: [
        d(22, "Africa's GDP powerhouses — Nigeria, South Africa, Egypt, Ethiopia, Kenya"),
        d(23, 'African Continental Free Trade Area (AfCFTA) — what it means'),
        d(24, "East Africa's economic model vs. West Africa — key differences"),
        d(25, 'China-Africa economic relations — debt, infrastructure, trade'),
        d(26, "Africa's demographic dividend — the youngest continent"),
        d(27, 'Commodity dependence in Africa — the resource curse'),
        r(28, "WEEKLY REVIEW — Map Africa's top 5 economies and their key drivers"),
      ],
    },
  ],
  resources: [
    'Economics — Paul Samuelson',
    'Poor Economics — Banerjee & Duflo',
    'CBN Annual Reports',
    'NBS Nigeria data',
    'African Development Bank reports',
    "Nonso Obikili's Nigerian Economy blog",
  ],
  contentIdeas: [
    'Thread: demand & supply explained with Lagos market examples',
    'Visual: AfCFTA in one infographic',
    'Tweet: what GDP misses about Nigeria',
  ],
};

const month1Finance: DomainTrack = {
  domain: 'finance',
  level: 'Beginner',
  theme: 'Personal Finance & Money Foundations',
  focus: 'Understanding money — how it works, how to manage it, how to grow it.',
  weeks: [
    {
      weekNumber: 1,
      title: 'The Language of Finance',
      days: [
        d(1, 'Assets vs. liabilities — the most important financial distinction'),
        d(2, 'Income statement, balance sheet, cash flow statement — what they are'),
        d(3, 'Net worth — how to calculate and why it matters'),
        d(4, 'Time value of money — why ₦100 today is worth more than ₦100 tomorrow'),
        d(5, 'Compound interest — the 8th wonder of the world'),
        d(6, 'Budgeting systems — 50/30/20 rule and Nigerian adaptations'),
        r(7, 'WEEKLY REVIEW — Build your personal net worth statement'),
      ],
    },
    {
      weekNumber: 2,
      title: 'Personal Finance Management',
      days: [
        d(8, 'Emergency funds — why and how much in a high-inflation environment'),
        d(9, 'Debt management — good debt vs. bad debt'),
        d(10, 'Nigerian banking system — savings, fixed deposits, money market funds'),
        d(11, 'Insurance basics — life, health, property insurance in Nigeria'),
        d(12, 'Pension in Nigeria — RSA, PFAs, and Contributory Pension Scheme'),
        d(13, 'Inflation-proofing your savings in Nigeria — practical strategies'),
        r(14, "WEEKLY REVIEW — 'How to survive financial volatility as a Nigerian'"),
      ],
    },
    {
      weekNumber: 3,
      title: 'Business Finance Basics',
      days: [
        d(15, 'Business vs. personal finance — why you must separate them'),
        d(16, 'Revenue, gross profit, net profit — reading a business P&L'),
        d(17, 'Cash flow management — why profitable businesses fail'),
        d(18, 'Startup funding options in Nigeria — bootstrapping, grants, angels, VCs'),
        d(19, 'Unit economics — CAC, LTV, burn rate, runway'),
        d(20, 'Pricing strategies and financial implications'),
        r(21, 'WEEKLY REVIEW — Build a simple financial model for a business idea'),
      ],
    },
    {
      weekNumber: 4,
      title: 'Investment Fundamentals',
      days: [
        d(22, 'Introduction to investing — stocks, bonds, real estate, alternatives'),
        d(23, 'Nigerian Stock Exchange (NGX) — how it works, how to participate'),
        d(24, 'Treasury bills and FGN bonds — the safest Nigerian investments'),
        d(25, "Real estate in Nigeria — why it's the most popular investment"),
        d(26, 'Dollar-denominated investments from Nigeria — Eurobonds, foreign stocks'),
        d(27, 'Crypto in Nigeria — regulations, risks, and reality'),
        r(28, 'WEEKLY REVIEW — Design your personal investment philosophy'),
      ],
    },
  ],
  resources: [
    'Rich Dad Poor Dad — Robert Kiyosaki',
    'The Psychology of Money — Morgan Housel',
    'Investopedia',
    'Nairametrics',
    'SEC Nigeria',
    'CBN consumer finance guides',
  ],
  contentIdeas: [
    'Carousel: net worth in 3 simple boxes',
    'Tweet: compound interest, the 8th wonder',
    'Video: Nigerian T-bills explained in 60s',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MONTH 2 — Intermediate Depth & Nigerian Context (July 1–31)
// ─────────────────────────────────────────────────────────────────────────────

const month2Law: DomainTrack = {
  domain: 'law',
  level: 'Intermediate',
  theme: 'Law in Action',
  focus: 'Tort, dispute resolution, international business law, and emerging tech law.',
  weeks: [
    {
      weekNumber: 5,
      title: 'Tort Law & Civil Liability',
      days: [
        d(29, 'What is tort law? Negligence, nuisance, defamation'),
        d(30, 'Defamation in the digital age — social media liability in Nigeria'),
        d(31, 'Product liability — what founders must know'),
        d(32, 'Privacy torts and the NDPA intersection'),
        d(33, 'Remedies in tort — damages, injunctions'),
        d(34, 'Real Nigerian tort cases and their outcomes'),
        r(35, "WEEKLY REVIEW — 'Can you be sued for a tweet in Nigeria?'"),
      ],
    },
    {
      weekNumber: 6,
      title: 'Dispute Resolution & Courts',
      days: [
        d(36, "Nigeria's court hierarchy — Magistrate to Supreme Court"),
        d(37, 'Litigation vs. arbitration vs. mediation — when to use each'),
        d(38, 'Alternative Dispute Resolution (ADR) in Nigerian business'),
        d(39, "Lagos Court of Arbitration — Africa's arbitration hub"),
        d(40, 'Small claims courts in Nigeria — how founders can recover small debts'),
        d(41, 'Legal aid and access to justice in Nigeria'),
        r(42, 'WEEKLY REVIEW — How to resolve a business dispute without going to court'),
      ],
    },
    {
      weekNumber: 7,
      title: 'International Business Law',
      days: [
        d(43, 'What is international law? Public vs. private international law'),
        d(44, 'WTO rules and how they affect Nigerian trade'),
        d(45, 'International contracts — INCOTERMS, jurisdiction clauses, governing law'),
        d(46, 'Foreign investment laws in Nigeria (NIPC Act, NOTAP)'),
        d(47, "Bilateral Investment Treaties (BITs) — Nigeria's agreements"),
        d(48, 'Cross-border dispute resolution — ICSID, ICC arbitration'),
        r(49, "WEEKLY REVIEW — 'If I sell to customers in the UK, which law governs?'"),
      ],
    },
    {
      weekNumber: 8,
      title: 'Tech, Digital & Emerging Law',
      days: [
        d(50, 'Cybercrime law in Nigeria — Cybercrimes Act 2015'),
        d(51, 'E-commerce law and digital contracts enforceability in Nigeria'),
        d(52, 'Blockchain, crypto, and the law — CBN, SEC positions'),
        d(53, 'AI and law — emerging global frameworks (EU AI Act overview)'),
        d(54, 'Platform liability — when is a tech company responsible for user content?'),
        d(55, 'Open source licensing for developers — MIT, GPL, Apache explained'),
        r(56, "WEEKLY REVIEW — 'Legal risks of building a tech product in Nigeria'"),
      ],
    },
  ],
  resources: [
    'Cybercrimes (Prohibition, Prevention etc.) Act 2015',
    'NIPC Act',
    'Lagos Court of Arbitration rules',
    'EU AI Act primer',
  ],
  contentIdeas: [
    "Thread: 'When can you actually be sued for a tweet?'",
    'Carousel: ADR vs. litigation, founder edition',
    'Tweet: open source licenses in 280 chars',
  ],
};

const month2Econ: DomainTrack = {
  domain: 'economics',
  level: 'Intermediate',
  theme: 'Economic Forces That Shape Business',
  focus: 'Development, trade systems, global economies, and behavioral lenses.',
  weeks: [
    {
      weekNumber: 5,
      title: 'Development Economics',
      days: [
        d(29, 'What is development economics? Beyond GDP'),
        d(30, 'Human Development Index (HDI) — where Nigeria sits globally'),
        d(31, 'Structural transformation — how economies industrialize'),
        d(32, 'The role of institutions in economic growth (Acemoglu & Robinson)'),
        d(33, 'Foreign aid vs. foreign investment — which actually develops Africa?'),
        d(34, 'Microfinance and financial inclusion — the African model'),
        r(35, "WEEKLY REVIEW — 'Why some African countries grow faster than Nigeria'"),
      ],
    },
    {
      weekNumber: 6,
      title: 'Trade & Global Economic Systems',
      days: [
        d(36, 'Comparative advantage — why countries trade'),
        d(37, 'Protectionism vs. free trade — tariffs, quotas, subsidies'),
        d(38, 'Bretton Woods institutions — IMF, World Bank, and their Africa track record'),
        d(39, 'Global value chains — where Africa and Nigeria fit'),
        d(40, "The dollar's global dominance and what it means for Nigeria"),
        d(41, 'BRICS, de-dollarization, and implications for Africa'),
        r(42, "WEEKLY REVIEW — 'What global trade rules actually mean for Nigerian exports'"),
      ],
    },
    {
      weekNumber: 7,
      title: 'Key Global Economies Deep Dive',
      days: [
        d(43, 'US economy — size, structure, Fed policy, global influence'),
        d(44, "China's economic model — state capitalism, Belt & Road, Africa strategy"),
        d(45, 'European Union economy — monetary union, fiscal constraints'),
        d(46, "India's economy — demographics, IT sector, growth model"),
        d(47, 'UAE/Gulf economies — oil diversification, free zones, fintech'),
        d(48, 'UK post-Brexit economy — lessons for developing nations'),
        r(49, 'WEEKLY REVIEW — Compare 3 global economies — what Nigeria can learn'),
      ],
    },
    {
      weekNumber: 8,
      title: 'Behavioral & Information Economics',
      days: [
        d(50, "Behavioral economics — why people don't act rationally"),
        d(51, 'Nudge theory and its applications in policy'),
        d(52, "Information asymmetry — Akerlof's Market for Lemons"),
        d(53, 'Network effects and platform economics'),
        d(54, 'Gig economy — economic implications for Africa'),
        d(55, 'Climate economics — carbon markets, green transition costs'),
        r(56, "WEEKLY REVIEW — 'How behavioral economics explains Nigerian financial decisions'"),
      ],
    },
  ],
  resources: [
    'Why Nations Fail — Acemoglu & Robinson',
    'Thinking, Fast and Slow — Kahneman',
    'IMF Article IV consultations (Nigeria)',
    'WTO trade policy reviews',
  ],
  contentIdeas: [
    "Thread: 'Why Nigeria is poorer than UAE despite similar oil'",
    'Carousel: Bretton Woods explained in 5 cards',
    'Tweet: nudge theory in your savings app',
  ],
};

const month2Finance: DomainTrack = {
  domain: 'finance',
  level: 'Intermediate',
  theme: 'Corporate Finance & Capital Markets',
  focus: 'How money, capital, and businesses actually structure themselves.',
  weeks: [
    {
      weekNumber: 5,
      title: 'Corporate Finance Fundamentals',
      days: [
        d(29, 'Capital structure — debt vs. equity financing'),
        d(30, 'Weighted Average Cost of Capital (WACC) — explained plainly'),
        d(31, 'Valuation basics — DCF, comparables, precedent transactions'),
        d(32, 'Working capital management — the lifeblood of operations'),
        d(33, 'Financial leverage — benefits and dangers'),
        d(34, 'Dividend policy and retained earnings'),
        r(35, "WEEKLY REVIEW — 'How investors actually value a Nigerian startup'"),
      ],
    },
    {
      weekNumber: 6,
      title: 'Capital Markets Deep Dive',
      days: [
        d(36, 'How stock markets work — listing, trading, settlement'),
        d(37, 'Bond markets — government and corporate bonds'),
        d(38, 'Derivatives — futures, options, swaps (simplified)'),
        d(39, 'Private equity and venture capital — deal structures'),
        d(40, 'African capital markets — NGX, JSE, NSE Kenya, EGX Egypt'),
        d(41, 'IPOs and secondary offerings — how companies list'),
        r(42, "WEEKLY REVIEW — 'What happens when a Nigerian company lists on NGX?'"),
      ],
    },
    {
      weekNumber: 7,
      title: 'Banking & Financial Systems',
      days: [
        d(43, 'How banks create money — fractional reserve banking'),
        d(44, 'Nigerian banking sector — Tier 1 banks, their business models'),
        d(45, "Central banking — CBN's roles and instruments"),
        d(46, 'Fintech disruption of traditional banking in Africa'),
        d(47, 'Islamic finance — principles and African applications'),
        d(48, 'Financial inclusion — mobile money, agent banking in Africa'),
        r(49, "WEEKLY REVIEW — 'How Nigerian banks make money'"),
      ],
    },
    {
      weekNumber: 8,
      title: 'Financial Statement Analysis',
      days: [
        d(50, 'Reading an annual report — what to look for'),
        d(51, 'Profitability ratios — ROE, ROA, net margin'),
        d(52, 'Liquidity ratios — current ratio, quick ratio'),
        d(53, 'Leverage ratios — debt-to-equity, interest coverage'),
        d(54, "Practical analysis — dissect MTN or Dangote's financials"),
        d(55, 'Red flags in financial statements — fraud signals'),
        r(56, 'WEEKLY REVIEW — Full financial analysis of one Nigerian company'),
      ],
    },
  ],
  resources: [
    'Corporate Finance — Berk & DeMarzo',
    'Financial Statement Analysis — Subramanyam',
    'NGX annual reports',
    'Dangote Cement & MTN Nigeria annual reports',
  ],
  contentIdeas: [
    'Thread: DCF in 7 tweets',
    'Carousel: how Nigerian banks actually make money',
    'Video: 5 red flags in any annual report',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MONTH 3 — Advanced Mastery & Global Depth (August 1–31)
// ─────────────────────────────────────────────────────────────────────────────

const month3Law: DomainTrack = {
  domain: 'law',
  level: 'Advanced',
  theme: 'Law as Power',
  focus:
    'International human rights, constitutional law, global regulation, and the law of the future.',
  weeks: [
    {
      weekNumber: 9,
      title: 'International Human Rights Law',
      days: [
        d(57, 'Universal Declaration of Human Rights — history and substance'),
        d(58, 'ICCPR — International Covenant on Civil and Political Rights'),
        d(59, "African Charter on Human and Peoples' Rights — the African framework"),
        d(60, 'ECOWAS Court of Justice — how Nigerians have won cases there'),
        d(61, 'Corporate responsibility and human rights (UN Guiding Principles)'),
        d(62, 'Tech companies and human rights — surveillance, data, censorship'),
        r(63, "WEEKLY REVIEW — 'Can a Nigerian take their government to an international court?'"),
      ],
    },
    {
      weekNumber: 10,
      title: 'Constitutional Law & Democracy',
      days: [
        d(64, 'Constitutionalism — rule of law, separation of powers, checks & balances'),
        d(65, 'Constitutional amendments in Nigeria — history and controversies'),
        d(66, 'Federalism vs. unitarism — the Nigerian tension'),
        d(67, 'Comparing constitutions — Nigeria vs. South Africa vs. USA'),
        d(68, 'Judicial independence — theory vs. Nigerian reality'),
        d(69, 'Electoral law and the 2023 elections legal aftermath'),
        r(70, "WEEKLY REVIEW — 'What a stronger Nigerian constitution would look like'"),
      ],
    },
    {
      weekNumber: 11,
      title: 'Global Regulatory & Compliance Law',
      days: [
        d(71, "GDPR — Europe's data law and its global extraterritorial reach"),
        d(72, 'Anti-money laundering (AML) and KYC laws — global & Nigerian'),
        d(73, 'FATF — the body that blacklisted Nigeria and what it means'),
        d(74, 'Sanctions law — OFAC, UN sanctions, and Nigerian business risks'),
        d(75, 'Competition/antitrust law — FCCPC Nigeria vs. EU competition law'),
        d(76, 'Environmental law — Nigerian oil pollution & international liability'),
        r(77, "WEEKLY REVIEW — 'Compliance risks for Nigerian founders selling globally'"),
      ],
    },
    {
      weekNumber: 12,
      title: 'Law of the Future',
      days: [
        d(78, 'Smart contracts — are they legally enforceable?'),
        d(79, 'DAO governance — legal personhood questions'),
        d(80, 'AI liability — who is responsible when AI causes harm?'),
        d(81, "Digital assets regulation — MiCA (EU), SEC (USA), and Nigeria's approach"),
        d(82, 'Space law — the Outer Space Treaty and commercial implications'),
        d(83, 'Biotech law — gene patents, CRISPR ethics, global frameworks'),
        r(84, "WEEKLY REVIEW — 'The legal frontier: what every tech builder must watch'"),
      ],
    },
  ],
  resources: [
    'UDHR & ICCPR full texts (OHCHR)',
    "African Charter on Human and Peoples' Rights",
    'GDPR text (EUR-Lex)',
    'FATF Mutual Evaluation reports (Nigeria)',
    'MiCA Regulation (EU)',
  ],
  contentIdeas: [
    'Thread: the ECOWAS Court cases Nigerians have won',
    'Carousel: GDPR for African founders in 5 cards',
    'Tweet: are smart contracts contracts?',
  ],
};

const month3Econ: DomainTrack = {
  domain: 'economics',
  level: 'Advanced',
  theme: 'Economic Power & Crisis',
  focus: 'Crises, heterodox schools, tech economics, and geopolitics.',
  weeks: [
    {
      weekNumber: 9,
      title: 'Economic History & Crises',
      days: [
        d(57, 'The Great Depression — causes, responses, lessons'),
        d(58, '2008 Global Financial Crisis — anatomy of a collapse'),
        d(59, "Nigeria's economic crises — 1986 SAP, 2016 recession, 2020–2024 freefall"),
        d(60, 'Hyperinflation case studies — Zimbabwe, Venezuela, Weimar Germany'),
        d(61, 'Debt crises — Latin America, Greece, Zambia, lessons for Nigeria'),
        d(62, 'Economic sanctions as weapons — Iran, Russia, North Korea cases'),
        r(63, "WEEKLY REVIEW — 'What Nigeria's economic crises have in common'"),
      ],
    },
    {
      weekNumber: 10,
      title: 'Heterodox Economics',
      days: [
        d(64, 'Keynesian economics vs. monetarism — the great debate'),
        d(65, 'Modern Monetary Theory (MMT) — can Nigeria print its way to growth?'),
        d(66, "Post-colonial economics — dependency theory and Africa's underdevelopment"),
        d(67, "Doughnut economics — Kate Raworth's model for sustainable prosperity"),
        d(68, 'Islamic economics — interest-free finance and its real-world models'),
        d(69, 'The degrowth movement — economics beyond endless expansion'),
        r(70, "WEEKLY REVIEW — 'Which economic model is best for Africa?'"),
      ],
    },
    {
      weekNumber: 11,
      title: 'Tech Economy & Platform Economics',
      days: [
        d(71, "Digital economy — how GDP misses the internet's value"),
        d(72, 'Big Tech economics — winner-takes-all, monopoly rents'),
        d(73, 'Creator economy — economic model of attention capitalism'),
        d(74, "Africa's tech economy — Nigeria, Kenya, Egypt ecosystems compared"),
        d(75, "Remittances — Nigeria's $20B+ industry and its economic role"),
        d(76, 'The economics of AI — productivity gains, labor displacement'),
        r(77, "WEEKLY REVIEW — 'How to build a business in Africa's digital economy'"),
      ],
    },
    {
      weekNumber: 12,
      title: 'Geopolitics & Economic Power',
      days: [
        d(78, "Oil economics — OPEC, petrodollar, and Nigeria's oil trap"),
        d(79, "US-China trade war — economic decoupling and Africa's position"),
        d(80, 'The economics of war — Ukraine, Gaza, and global supply chains'),
        d(81, 'Food economics — global food systems, inflation, and African agriculture'),
        d(82, "Critical minerals — lithium, cobalt, and Africa's new economic power"),
        d(83, 'The future of work — automation, universal basic income debates'),
        r(84, "WEEKLY REVIEW — 'Why Africa's mineral wealth could change the global economy'"),
      ],
    },
  ],
  resources: [
    'This Time Is Different — Reinhart & Rogoff',
    'Doughnut Economics — Kate Raworth',
    'How Asia Works — Joe Studwell',
    'IMF & World Bank crisis reports',
  ],
  contentIdeas: [
    'Thread: the anatomy of the 2016 Nigerian recession',
    'Carousel: 5 hyperinflation lessons for Nigeria',
    'Tweet: MMT debunked (or supported) in 280',
  ],
};

const month3Finance: DomainTrack = {
  domain: 'finance',
  level: 'Advanced',
  theme: 'Global Finance & Wealth Architecture',
  focus: 'Portfolio theory, risk, the global financial system, and how wealth is actually built.',
  weeks: [
    {
      weekNumber: 9,
      title: 'Portfolio Theory & Asset Allocation',
      days: [
        d(57, 'Modern Portfolio Theory — diversification, risk-return optimization'),
        d(58, 'Asset allocation strategies — strategic vs. tactical'),
        d(59, 'Risk-adjusted returns — Sharpe ratio, Sortino ratio'),
        d(60, 'Factor investing — value, growth, momentum, quality'),
        d(61, 'Alternative investments — hedge funds, commodities, collectibles'),
        d(62, 'Building a multi-currency portfolio as a Nigerian'),
        r(63, 'WEEKLY REVIEW — Design a 5-year investment portfolio for an African founder'),
      ],
    },
    {
      weekNumber: 10,
      title: 'Risk Management & Financial Engineering',
      days: [
        d(64, 'Types of financial risk — market, credit, liquidity, operational'),
        d(65, 'Hedging strategies — FX hedging for Nigerian businesses'),
        d(66, 'Insurance as financial risk management'),
        d(67, 'Value at Risk (VaR) — how banks measure risk'),
        d(68, 'Country risk and emerging market investing'),
        d(69, 'Startup financial risk management — runway, burn, scenario planning'),
        r(70, "WEEKLY REVIEW — 'How to protect your business from financial shocks'"),
      ],
    },
    {
      weekNumber: 11,
      title: 'Global Financial Architecture',
      days: [
        d(71, 'The global monetary system — Bretton Woods to today'),
        d(72, 'How central banks coordinate — BIS, Fed swaps, global liquidity'),
        d(73, "Sovereign wealth funds — Norway, Gulf, Singapore, and Africa's versions"),
        d(74, "Eurodollar system — the 'shadow' global dollar system"),
        d(75, 'Financial crises mechanisms — contagion, bank runs, sudden stops'),
        d(76, 'IMF programs — what Nigeria has agreed to and what it costs'),
        r(77, "WEEKLY REVIEW — 'What the global financial system means for Nigerian business'"),
      ],
    },
    {
      weekNumber: 12,
      title: 'Wealth Architecture & Legacy Finance',
      days: [
        d(78, 'How the wealthy build and protect wealth — family offices, trusts'),
        d(79, 'Tax optimization strategies — legal structures for wealthy individuals'),
        d(80, 'Real estate as wealth — structures, leverage, passive income'),
        d(81, 'Succession planning and estate planning in Nigeria'),
        d(82, 'Philanthropy as finance — DAFs, foundations, impact investing'),
        d(83, 'Building generational wealth as an African founder'),
        r(84, "WEEKLY REVIEW — 'My wealth architecture plan as a founder'"),
      ],
    },
  ],
  resources: [
    'A Random Walk Down Wall Street — Burton Malkiel',
    'Principles — Ray Dalio',
    'BIS Quarterly Review',
    'Norges Bank Investment Management reports',
  ],
  contentIdeas: [
    'Thread: building a multi-currency portfolio from Nigeria',
    'Carousel: VaR explained in 4 cards',
    'Tweet: what the eurodollar system actually is',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MONTH 4 — Integration, Application & Teaching (September 1–30)
// ─────────────────────────────────────────────────────────────────────────────

const month4Law: DomainTrack = {
  domain: 'law',
  level: 'Synthesis',
  theme: 'Law as Strategic Weapon',
  focus: 'Founder-level strategy, policy, cross-domain synthesis, and teaching what you know.',
  weeks: [
    {
      weekNumber: 13,
      title: 'Legal Strategy for Founders',
      days: [
        d(85, 'Legal due diligence — what investors check before funding you'),
        d(86, 'Cap table structuring and shareholder agreements'),
        d(87, 'IP strategy — building a defensible IP portfolio'),
        d(88, 'Privacy-by-design and legal compliance as product features'),
        d(89, 'Legal risks in fundraising — securities law implications'),
        d(90, 'Term sheet basics — what every founder must understand'),
        r(91, "WEEKLY REVIEW — 'Legal checklist before raising a seed round'"),
      ],
    },
    {
      weekNumber: 14,
      title: 'Policy, Advocacy & Law Reform',
      days: [
        d(92, 'How laws are made in Nigeria — legislative process'),
        d(93, 'Tech policy in Nigeria — NITDA, NCC, and the startup ecosystem'),
        d(94, 'Startup Act Nigeria — what it contains and its limitations'),
        d(95, 'How founders can influence policy — advocacy, coalitions'),
        d(96, 'Global tech policy trends affecting Africa — DSA, AI Act, DMA'),
        d(97, "Law and ethics — when law permits but ethics don't"),
        r(98, "WEEKLY REVIEW — 'What Nigeria's tech policy needs from founders'"),
      ],
    },
    {
      weekNumber: 15,
      title: 'Cross-Domain Legal Synthesis',
      days: [
        d(99, 'Where law meets economics — regulatory economics, externalities'),
        d(100, 'Where law meets finance — securities regulation, financial crimes'),
        d(101, "Case study — Flutterwave's legal challenges"),
        d(102, 'Case study — Binance Nigeria — how crypto regulation actually works'),
        d(103, 'Building a legally resilient company from day one'),
        d(104, 'The lawyer-founder relationship — how to work with lawyers effectively'),
        r(105, "WEEKLY REVIEW — 'Full legal stack for a Nigerian tech startup'"),
      ],
    },
    {
      weekNumber: 16,
      title: 'Final Week — Synthesis & Teaching',
      days: [
        d(106, "Write '10 legal concepts every Nigerian founder must know'"),
        d(107, 'Identify 3 legal risks in your own current projects'),
        d(108, 'Create a legal resource guide for your community'),
        d(109, 'Record your best law insight from 4 months'),
        d(110, 'Draft a simple 1-page founder legal checklist for public sharing'),
        r(111, "FINAL LAW REVIEW — What I know now that I didn't know 4 months ago"),
      ],
    },
  ],
  resources: [
    'Nigeria Startup Act 2022',
    'EU Digital Services Act (DSA)',
    'YC SAFE & post-money templates',
  ],
  contentIdeas: [
    'Public PDF: founder legal checklist',
    'Long thread: how to read a term sheet',
    'Newsletter: 10 legal concepts every Nigerian founder must know',
  ],
};

const month4Econ: DomainTrack = {
  domain: 'economics',
  level: 'Synthesis',
  theme: 'Economics as Decision Framework',
  focus: 'Applying economic thinking to entrepreneurship, data, and social impact.',
  weeks: [
    {
      weekNumber: 13,
      title: 'Economics of Entrepreneurship',
      days: [
        d(85, 'Entrepreneurship economics — Schumpeter, creative destruction, innovation'),
        d(86, 'Market failure and startup opportunity — where government fails, founders win'),
        d(87, 'The economics of pricing — price discrimination, dynamic pricing'),
        d(88, 'Labor economics for startups — wages, productivity, talent markets'),
        d(89, 'Agglomeration effects — why Lagos and Nairobi produce more startups'),
        d(90, 'Industrial policy — what governments can do to support innovation'),
        r(91, "WEEKLY REVIEW — 'Where are the biggest economic opportunities in Nigeria now?'"),
      ],
    },
    {
      weekNumber: 14,
      title: 'Economic Data & Research',
      days: [
        d(92, 'How to read economic data — NBS reports, CBN bulletins'),
        d(93, 'Economic forecasting — methods, reliability, and limitations'),
        d(94, 'Sector analysis — using economic data to pick winning sectors'),
        d(95, 'Economic indicators for founders — leading vs. lagging indicators'),
        d(96, "Nigeria's economic outlook 2026–2030 — scenarios and probabilities"),
        d(97, "Africa's fastest-growing economies — Ethiopia, Rwanda, Côte d'Ivoire"),
        r(98, 'WEEKLY REVIEW — Publish an economic brief on one Nigerian sector'),
      ],
    },
    {
      weekNumber: 15,
      title: 'Economics of Social Impact',
      days: [
        d(99, 'Public goods and externalities — when markets fail society'),
        d(100, "Education economics — returns to education, Nigeria's challenges"),
        d(101, "Health economics — the cost of Nigeria's healthcare crisis"),
        d(102, "Climate change economics — Africa's disproportionate burden"),
        d(103, 'Economics of inequality — why it matters beyond morality'),
        d(104, 'Social enterprise economics — can impact pay for itself?'),
        r(105, "WEEKLY REVIEW — 'Economic case for investing in Nigeria's youth'"),
      ],
    },
    {
      weekNumber: 16,
      title: 'Final Week — Synthesis & Teaching',
      days: [
        d(106, "Write 'My economic worldview after 4 months of study'"),
        d(107, 'Identify 3 economic forces currently shaping your business sector'),
        d(108, "Create an 'Economics of Nigeria' beginner guide for your community"),
        d(109, 'Record your most surprising economic insight from the course'),
        d(110, "Draft 5 economic thesis statements about Africa's next decade"),
        r(111, 'FINAL ECONOMICS REVIEW — How my economic thinking has changed'),
      ],
    },
  ],
  resources: [
    'NBS Nigeria Statistical Bulletin',
    'CBN Statistical Bulletin',
    'IMF WEO database',
    'World Bank Africa Pulse',
  ],
  contentIdeas: [
    'Sector brief PDF: one Nigerian sector deep dive',
    "Thread: 'My 5 theses on Africa's next decade'",
    'Public guide: Economics of Nigeria for beginners',
  ],
};

const month4Finance: DomainTrack = {
  domain: 'finance',
  level: 'Synthesis',
  theme: 'Finance as Founder Superpower',
  focus: 'Strategic financial modelling, cross-border finance, and personal wealth architecture.',
  weeks: [
    {
      weekNumber: 13,
      title: 'Startup Financial Strategy',
      days: [
        d(85, 'Building a financial model that raises money — key components'),
        d(86, 'Revenue forecasting — methods and honest assumptions'),
        d(87, 'Fundraising strategy — which instrument, when, at what valuation'),
        d(88, 'SAFE notes vs. convertible notes vs. equity rounds — when to use each'),
        d(89, 'Financial storytelling — translating numbers into narrative for investors'),
        d(90, 'Down rounds, bridge rounds, and financial distress management'),
        r(91, 'WEEKLY REVIEW — Build a complete financial model for a personal project'),
      ],
    },
    {
      weekNumber: 14,
      title: 'Cross-Border Finance for African Founders',
      days: [
        d(92, 'Flip structures — Delaware C-Corp and why Nigerian startups flip'),
        d(93, 'Cross-border payments for African businesses — legal and financial'),
        d(94, 'FX risk management for Nigerian startups earning in dollars'),
        d(95, 'African Development Finance Institutions — DFIs, OPIC, DFC, Proparco'),
        d(96, 'Grant financing — Innovate UK, Gates, USAID, EU for African founders'),
        d(97, 'Diaspora finance — leveraging Nigerian diaspora capital'),
        r(98, "WEEKLY REVIEW — 'Finance options for African founders beyond VC'"),
      ],
    },
    {
      weekNumber: 15,
      title: 'Personal Wealth Building System',
      days: [
        d(99, 'Designing your personal financial system — accounts, flows, automation'),
        d(100, 'Tax efficiency for founders — salary vs. dividend vs. retained earnings'),
        d(101, 'Dollar-cost averaging into global markets from Nigeria'),
        d(102, 'Real estate vs. stocks vs. business — portfolio allocation debate'),
        d(103, 'Financial independence math — the 25x rule, safe withdrawal rate'),
        d(104, 'Wealth protection — legal structures, insurance, diversification'),
        r(105, 'WEEKLY REVIEW — Design your personal 5-year wealth building plan'),
      ],
    },
    {
      weekNumber: 16,
      title: 'Final Week — Synthesis & Teaching',
      days: [
        d(106, "Write 'My financial philosophy after 4 months of study'"),
        d(107, 'Create a financial literacy resource for Nigerian young professionals'),
        d(108, 'Document your personal wealth building system'),
        d(109, 'Record your most powerful finance insight from the entire course'),
        d(110, "Draft your personal financial manifesto — principles you'll live by"),
        r(111, 'FINAL FINANCE REVIEW — Financial intelligence transformation scorecard'),
      ],
    },
  ],
  resources: ['Venture Deals — Brad Feld', 'Y Combinator SAFE docs', 'AfDB & IFC reports'],
  contentIdeas: [
    'Public PDF: financial literacy for young Nigerian professionals',
    'Thread: Delaware flip in 10 tweets',
    'Personal financial manifesto (public)',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
export const CURRICULUM: MonthCurriculum[] = [
  {
    month: 1,
    name: 'Foundations & Frameworks',
    monthName: 'June',
    theme: 'Foundations & Frameworks',
    dateRange: 'June 1 – 30, 2026',
    startDay: 1,
    endDay: 28,
    tracks: { law: month1Law, economics: month1Econ, finance: month1Finance },
  },
  {
    month: 2,
    name: 'Intermediate Depth & Nigerian Context',
    monthName: 'July',
    theme: 'Intermediate Depth & Nigerian Context',
    dateRange: 'July 1 – 31, 2026',
    startDay: 29,
    endDay: 56,
    tracks: { law: month2Law, economics: month2Econ, finance: month2Finance },
  },
  {
    month: 3,
    name: 'Advanced Mastery & Global Depth',
    monthName: 'August',
    theme: 'Advanced Mastery & Global Depth',
    dateRange: 'August 1 – 31, 2026',
    startDay: 57,
    endDay: 84,
    tracks: { law: month3Law, economics: month3Econ, finance: month3Finance },
  },
  {
    month: 4,
    name: 'Integration, Application & Teaching',
    monthName: 'September',
    theme: 'Integration, Application & Teaching',
    dateRange: 'September 1 – 30, 2026',
    startDay: 85,
    endDay: 111,
    tracks: { law: month4Law, economics: month4Econ, finance: month4Finance },
  },
];

export const TOTAL_CALENDAR_DAYS = 122;
export const TOTAL_CURRICULUM_DAYS = 111;

export const DOMAIN_META: Record<
  Domain,
  { label: string; icon: string; accent: string; description: string }
> = {
  law: {
    label: 'Law',
    icon: '⚖️',
    accent: 'law',
    description:
      'Nigerian and global legal systems — from the 1999 Constitution to smart contracts and the law of AI.',
  },
  economics: {
    label: 'Economics',
    icon: '📊',
    accent: 'econ',
    description:
      'How economies actually work — Nigerian, African, and global — and how to think clearly about them.',
  },
  finance: {
    label: 'Finance',
    icon: '💰',
    accent: 'finance',
    description:
      'From personal money to capital markets to wealth architecture — finance as a founder superpower.',
  },
};

// DOMAIN_LABELS moved to lib/domain.ts — import from there.

/** Ordered tuple of all LEF domains — use this instead of inline literals. */
export const LEF_DOMAINS = ['law', 'economics', 'finance'] as const satisfies readonly Domain[];

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

export function findDayTopic(domain: Domain, day: number): string | null {
  for (const month of CURRICULUM) {
    const track = month.tracks[domain];
    for (const week of track.weeks) {
      const found = week.days.find((x) => x.day === day);
      if (found) return found.topic;
    }
  }
  return null;
}

export function findDayMeta(
  domain: Domain,
  day: number,
): {
  topic: string;
  isReview: boolean;
  weekTitle: string;
  month: number;
  weekNumber: number;
} | null {
  for (const month of CURRICULUM) {
    const track = month.tracks[domain];
    for (const week of track.weeks) {
      const found = week.days.find((x) => x.day === day);
      if (found) {
        return {
          topic: found.topic,
          isReview: found.isReview,
          weekTitle: week.title,
          month: month.month,
          weekNumber: week.weekNumber,
        };
      }
    }
  }
  return null;
}

export function getMonthByCurriculumDay(day: number): MonthCurriculum | null {
  return CURRICULUM.find((m) => day >= m.startDay && day <= m.endDay) ?? null;
}

export const RESOURCE_URLS: Record<string, string> = {
  // ── Law ──────────────────────────────────────────────────────────────────
  // ✅ Verified working
  '1999 Constitution of Nigeria': 'https://www.constituteproject.org/constitution/Nigeria_1999',
  // ⚠️ CAC PDF server returns 403 to bots; use CAC homepage instead
  'CAMA 2020 (CAC website)': 'https://cac.gov.ng/',
  // ⚠️ NDPC site blocks bots; use the official Startup portal which hosts it
  'Nigeria Data Protection Act 2023': 'https://startup.gov.ng/',
  // ⚠️ Lawyard.ng SSL cert expired — use NigeriaLaw.org (stable mirror)
  "Afe Babalola's Nigerian Law of Contract": 'https://lawnigeria.com/LawsoftheFederation/',
  'Lawyard.ng': 'https://lawnigeria.com/',
  // ✅ Verified working (was /resources/ → 404; /insights/ works)
  'SPA Ajibade & Co legal insights': 'https://spaajibade.com/insights/',
  // ⚠️ NCC PDF link may require direct navigation; use NCC main site
  'Cybercrimes (Prohibition, Prevention etc.) Act 2015':
    'https://www.ncc.gov.ng/legal-regulatory/legislation/',
  // ⚠️ NIPC PDF link may 403; use NIPC main site
  'NIPC Act': 'https://www.nipc.gov.ng/about-nipc/nipc-legislation/',
  // ✅ Verified working
  'Lagos Court of Arbitration rules': 'https://lca.org.ng/',
  // ✅ Verified working
  'EU AI Act primer': 'https://artificialintelligenceact.eu/',
  // ⚠️ OHCHR blocks bots but works in browser — keep URL
  'UDHR & ICCPR full texts (OHCHR)':
    'https://www.ohchr.org/en/instruments-mechanisms/instruments/universal-declaration-human-rights',
  // ⚠️ AU website blocks some networks — keep URL, stable in browser
  "African Charter on Human and Peoples' Rights":
    'https://au.int/en/treaties/african-charter-human-and-peoples-rights',
  // ✅ Verified working
  'GDPR text (EUR-Lex)': 'https://gdpr-info.eu/',
  // ⚠️ FATF blocks bots but works in browser — keep URL
  'FATF Mutual Evaluation reports (Nigeria)':
    'https://www.fatf-gafi.org/en/publications/Mutualevaluations/Mer-nigeria-2021.html',
  // ✅ Verified (ESMA page)
  'MiCA Regulation (EU)':
    'https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica',
  // ✅ Verified — official Nigeria Startup Act portal (NITDA link 404'd)
  'Nigeria Startup Act 2022': 'https://startup.gov.ng/',
  // ✅ EU Digital Services Act — stable EU Commission page
  'EU Digital Services Act (DSA)':
    'https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package',
  // ✅ Verified working
  'YC SAFE & post-money templates': 'https://www.ycombinator.com/documents/',

  // ── Economics ─────────────────────────────────────────────────────────────
  // ✅ Archive.org links are stable
  'Economics — Paul Samuelson': 'https://archive.org/details/economics0000samu',
  // ⚠️ pooreconomics.com timed out (slow server) — use archive.org fallback
  'Poor Economics — Banerjee & Duflo': 'https://archive.org/details/pooreconomicssra00bane',
  // ✅ CBN publications hub (annualreports.asp 404'd; /documents/ works)
  'CBN Annual Reports': 'https://www.cbn.gov.ng/documents/',
  // ✅ Verified working
  'NBS Nigeria data': 'https://nigerianstat.gov.ng/',
  // ⚠️ AfDB blocks bots; use their open knowledge portal
  'African Development Bank reports': 'https://www.afdb.org/en/knowledge',
  // ✅ Updated — Nonso Obikili now publishes here
  "Nonso Obikili's Nigerian Economy blog": 'https://nonsoobikili.com/',
  // ✅ Archive.org stable
  'Why Nations Fail — Acemoglu & Robinson': 'https://archive.org/details/whynationsfailor0000acem',
  // ✅ Archive.org stable
  'Thinking, Fast and Slow — Kahneman': 'https://archive.org/details/thinking-fast-and-slow',
  // ⚠️ IMF blocks bots but works in browser — keep URL
  'IMF Article IV consultations (Nigeria)': 'https://www.imf.org/en/Countries/NGA',
  // ✅ Verified working
  'WTO trade policy reviews': 'https://www.wto.org/english/tratop_e/tpr_e/tpr_e.htm',
  // ✅ Archive.org stable
  'This Time Is Different — Reinhart & Rogoff':
    'https://archive.org/details/thistimeisdiffer0000rein',
  // ✅ Verified working
  'Doughnut Economics — Kate Raworth': 'https://www.kateraworth.com/doughnut/',
  // ✅ Archive.org stable
  'How Asia Works — Joe Studwell': 'https://archive.org/details/howasiaworks0000stud_k1u3',

  // ── Finance ──────────────────────────────────────────────────────────────
  // ✅ Archive.org stable
  'Rich Dad Poor Dad — Robert Kiyosaki': 'https://archive.org/details/RichDadPoorDad_201811',
  // ✅ Original blog post (morganhousel.com/psychology-of-money 404'd)
  'The Psychology of Money — Morgan Housel': 'https://collabfund.com/blog/the-psychology-of-money/',
  // ✅ Verified working
  Investopedia: 'https://www.investopedia.com/',
  // ✅ Verified working
  Nairametrics: 'https://nairametrics.com/',
  // ✅ Verified working
  'SEC Nigeria': 'https://sec.gov.ng/',
  // ⚠️ CBN blocks bots; use CBN main publications hub
  'CBN consumer finance guides': 'https://www.cbn.gov.ng/documents/',
  // ✅ Archive.org stable
  'Corporate Finance — Berk & DeMarzo': 'https://archive.org/details/corporatefinance0000berk',
  'Financial Statement Analysis — Subramanyam':
    'https://archive.org/details/financialstateme0000subr',
  // ✅ NGX data hub (annual-reports sub-path timed out; data/ is confirmed)
  'NGX annual reports': 'https://ngxgroup.com/exchange/data/',
  // ✅ NGX corporate disclosures page — confirmed via homepage navigation
  'Dangote Cement & MTN Nigeria annual reports':
    'https://ngxgroup.com/exchange/data/corporate-disclosures/',
  // ✅ Archive.org stable
  'A Random Walk Down Wall Street — Burton Malkiel':
    'https://archive.org/details/randomwalkdownwa00malk_0',
  // ✅ Verified working
  'Principles — Ray Dalio': 'https://www.principles.com/',
  // ✅ Khan Academy economics hub (stable)
  'Khan Academy — Economics & Finance': 'https://www.khanacademy.org/economics-finance-domain',
  // ⚠️ BusinessDay blocks bots but works in browser — keep URL
  'BusinessDay Nigeria': 'https://businessday.ng/',
  // ✅ IMF Blogs (confirmed working)
  'IMF Working Papers & Blogs': 'https://www.imf.org/en/Blogs',
  // ✅ Verified working
  'World Bank Open Data': 'https://data.worldbank.org/country/NG',

  // ── Additional verified resources added ─────────────────────────────────
  // All URLs below verified working
  'Crash Course Economics (YouTube playlist)':
    'https://www.youtube.com/playlist?list=PL1oDmcs0xTD-dJN1PL2N1urX0EKupBJkQ',
  'Investopedia Academy': 'https://www.investopedia.com/financial-term-dictionary-4769738',
  'NigeriaLaw.org (Laws of the Federation)': 'https://lawnigeria.com/LawsoftheFederation/',
  'CBN Monetary Policy': 'https://www.cbn.gov.ng/monetarypolicy/',
  'SEC Nigeria — Capital Market Rules': 'https://sec.gov.ng/rules-and-regulations/',
  'Nigeria Startup Act Portal': 'https://startup.gov.ng/',
  'The Psychology of Money (original essay)':
    'https://collabfund.com/blog/the-psychology-of-money/',
  'IMF Nigeria Economic Outlook': 'https://www.imf.org/en/Countries/NGA',
  'World Bank Nigeria Overview': 'https://www.worldbank.org/en/country/nigeria/overview',
};
