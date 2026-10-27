
export const HOMEPAGE_CONTENT = {
  brand: "BudgÉtudiant",

  navigation: [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Notre approche", href: "#approche" },
  ],

  hero: {
    eyebrow: "LE BUDGET ÉTUDIANT, SIMPLEMENT",
    title: "Ton budget sous contrôle. Tes projets en tête.",
    description:
      "Suis tes dépenses, visualise ton argent disponible et gère tes finances étudiantes sans prise de tête.",
    primaryAction: "Découvrir mon espace",
    secondaryAction: "Voir les fonctionnalités",
    reassurance: "Simple à utiliser · Pensé pour les étudiants",
  },

  features: [
    {
      id: "budget",
      icon: "€",
      title: "Une vision claire de ton budget",
      description:
        "Visualise ce qu'il te reste pour le mois et prends tes décisions plus sereinement.",
    },
    {
      id: "expenses",
      icon: "↗",
      title: "Des dépenses mieux organisées",
      description:
        "Retrouve tes dépenses par catégorie et comprends où va ton argent.",
    },
    {
      id: "goals",
      icon: "◎",
      title: "Des projets qui avancent",
      description:
        "Apprends à mieux gérer ton argent et garde de la place pour tes envies.",
    },
  ],

  preview: {
    label: "APERÇU DE TON ESPACE",
    title: "Tes finances en un coup d'œil",
    period: "Ce mois-ci",
    budgetLabel: "Budget mensuel",
    expensesLabel: "Dépenses",
    remainingLabel: "Il te reste",
    budget: 850,
    expenses: 524.5,
    categoriesTitle: "Mes dépenses",
    categories: [
      { id: "housing", label: "Logement", amount: 320, percentage: 61 },
      { id: "food", label: "Alimentation", amount: 124.5, percentage: 24 },
      { id: "leisure", label: "Loisirs", amount: 80, percentage: 15 },
    ],
  },

  approach: {
    eyebrow: "FAIT POUR LA VIE ÉTUDIANTE",
    title: "Mieux gérer son argent, sans se compliquer la vie.",
    description:
      "Entre le loyer, les courses, les transports, les abonnements et les sorties, gérer son argent quand on est étudiant peut vite devenir compliqué. BudgÉtudiant t’aide à centraliser tes dépenses, à visualiser ton budget disponible et à mieux comprendre tes habitudes financières. En quelques instants, tu sais où tu en es, ce que tu peux dépenser et comment anticiper la fin du mois. L’objectif n’est pas de te priver, mais de te donner les clés pour faire tes choix sereinement et profiter pleinement de ta vie étudiante.",
},

  footer: {
    tagline: "Ton argent, tes choix, ton équilibre.",
    copyright: "© BudgÉtudiant",
  },
};

export const HOMEPAGE_ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
};
