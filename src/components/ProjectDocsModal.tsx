import React from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Gauge,
  Waves,
  HeartPulse,
  ThermometerSun,
  Droplets,
  Zap,
  Link2,
  type LucideIcon,
} from 'lucide-react';

interface Source {
  label: string;
  url?: string;
  note: string;
}

type Accent = 'sky' | 'rose' | 'purple' | 'indigo' | 'amber' | 'cyan' | 'yellow';

interface MethodCard {
  id: string;
  title: string;
  icon: LucideIcon;
  accent: Accent;
  description: React.ReactNode;
  sources: Source[];
}

const accentStyles: Record<
  Accent,
  { box: string; icon: string; iconColor: string; title: string; source: string }
> = {
  sky: {
    box: 'bg-sky-950/30 border-sky-800/40',
    icon: 'bg-sky-950/80 border-sky-500/40',
    iconColor: 'text-sky-400',
    title: 'text-sky-300',
    source: 'text-sky-500',
  },
  rose: {
    box: 'bg-rose-950/20 border-rose-800/40',
    icon: 'bg-rose-950/80 border-rose-500/40',
    iconColor: 'text-rose-400',
    title: 'text-rose-300',
    source: 'text-rose-500',
  },
  purple: {
    box: 'bg-purple-950/20 border-purple-800/40',
    icon: 'bg-purple-950/80 border-purple-500/40',
    iconColor: 'text-purple-400',
    title: 'text-purple-300',
    source: 'text-purple-500',
  },
  indigo: {
    box: 'bg-indigo-950/20 border-indigo-800/40',
    icon: 'bg-indigo-950/80 border-indigo-500/40',
    iconColor: 'text-indigo-400',
    title: 'text-indigo-300',
    source: 'text-indigo-500',
  },
  amber: {
    box: 'bg-amber-950/20 border-amber-800/40',
    icon: 'bg-amber-950/80 border-amber-500/40',
    iconColor: 'text-amber-400',
    title: 'text-amber-300',
    source: 'text-amber-500',
  },
  cyan: {
    box: 'bg-cyan-950/20 border-cyan-800/40',
    icon: 'bg-cyan-950/80 border-cyan-500/40',
    iconColor: 'text-cyan-400',
    title: 'text-cyan-300',
    source: 'text-cyan-500',
  },
  yellow: {
    box: 'bg-yellow-950/20 border-yellow-800/40',
    icon: 'bg-yellow-950/80 border-yellow-500/40',
    iconColor: 'text-yellow-400',
    title: 'text-yellow-300',
    source: 'text-yellow-500',
  },
};

const cards: MethodCard[] = [
  {
    id: 'model-akustyczny',
    title: 'Model Akustyczny – Założenia Metodologiczne',
    icon: Volume2,
    accent: 'sky',
    description: (
      <div className="space-y-2">
        <p>
          Zastosowano <strong>model 1/r<sup>1,5</sup></strong> uwzględniający odbicia od gruntu i
          inwersje atmosferyczne. Odbicia od ziemi oraz nocne inwersje temperatury „zatrzymują"
          dźwięk bliżej powierzchni ziemi i uginają fale z powrotem ku dołowi, co spowalnia spadek
          hałasu do ok. <strong>4,5 dB przy każdym podwojeniu odległości</strong>.
        </p>
        <p>
          Model sferyczny (1/r², spadek 6 dB na podwojenie odległości) zakłada rozchodzenie się
          dźwięku w idealnej, nieograniczonej przestrzeni bez przeszkód. W warunkach rzeczywistych
          odbicia gruntowe, inwersje termiczne i uwarstwienie atmosfery znacząco spowalniają
          tłumienie.
        </p>
      </div>
    ),
    sources: [
      {
        label: 'Lyver Data Center Noise Study (2022)',
        url: 'https://protectpwc.org/wp-content/uploads/2023/02/Lyver-Data-Center-Noise-Study-123122.pdf',
        note: 'Poziom źródłowy wentylatorów: 65 dBA w odległości 500 stóp (152,4 m). Na podstawie badania akustycznego centrów danych.',
      },
    ],
  },
  {
    id: 'szum-generatory',
    title: 'Ciągły szum a tymczasowy hałas generatorów',
    icon: Gauge,
    accent: 'rose',
    description: (
      <p>
        <strong>Ciągły szum wentylatorów i systemów HVAC</strong>, utrzymujący się 24 godziny na
        dobę, 7 dni w tygodniu, bywa <strong>znacznie bardziej uciążliwy niż okresowe testy
        generatorów diesla</strong>. Testy generatorów są intensywne, ale czasowo ograniczone
        (zazwyczaj raz w miesiącu). Stały, nieprzerwany szum uniemożliwia jakąkolwiek adaptację i
        regenerację, prowadząc do przewlekłego stresu i zaburzeń snu.
      </p>
    ),
    sources: [
      {
        label: 'Decibel International – Przewodnik akustyczny dla centrów danych',
        url: 'https://www.decibelinternational.pl/blog/kompleksowy-przewodnik-po-d-wi-koszczelno-ci-i-optymalizacji-akustycznej-dla-centr-w-danych-6/',
        note: 'Poziom źródłowy silników diesla: 95 dBA w odległości 7 metrów od wydechu.',
      },
    ],
  },
  {
    id: 'niskie-czestotliwosci',
    title: 'Wpływ niskich częstotliwości (Low-Frequency Noise)',
    icon: Waves,
    accent: 'purple',
    description: (
      <div className="space-y-2">
        <p>
          Prezentowane wartości w skali <strong>dBA drastycznie niedoszacowują uciążliwości
          dźwięków o niskiej częstotliwości</strong> (poniżej 200 Hz) generowanych przez systemy
          HVAC oraz agregaty prądotwórcze. Skala dBA (krzywa A) została zaprojektowana do pomiaru
          dźwięków o średnich częstotliwościach.
        </p>
        <p>
          <strong>Niskie częstotliwości nie są pochłaniane przez powietrze, drzewa ani standardowe
          ekrany akustyczne</strong> – rozprzestrzeniają się niemal wyłącznie na drodze
          geometrycznej i mogą być wyraźnie słyszalne w odległości nawet <strong>3,2–4 km</strong>{' '}
          od źródła.
        </p>
      </div>
    ),
    sources: [
      {
        label: 'Fowler & Finn – Low Frequency Noise from Data Centers',
        url: 'https://static1.squarespace.com/static/59af5a537131a5b42451a91d/t/6a74a3aebc65c55b93fbbef7/1786028975013/DataCenters_BoA_LowFrequencyNoise_Fowler-Finn.pdf',
        note: 'Analiza wpływu hałasu niskoczęstotliwościowego generowanego przez centra danych na społeczności lokalne.',
      },
    ],
  },
  {
    id: 'zdrowie',
    title: 'Wpływ na zdrowie – Przewlekła deprywacja snu',
    icon: HeartPulse,
    accent: 'indigo',
    description: (
      <p>
        Ciągły nocny szum uniemożliwia głęboki, regeneracyjny odpoczynek. Przewlekły brak snu u
        dorosłych i dzieci prowadzi do permanentnego zmęczenia, zaburzeń nastroju, a także
        zwiększa ryzyko wypadków komunikacyjnych i w miejscu pracy. U dzieci brak odpowiedniej
        ilości snu może dodatkowo zmniejszać wydzielanie hormonów wzrostu.
      </p>
    ),
    sources: [
      {
        label: 'Normy hałasu w środowisku (Polska)',
        note: 'Rozporządzenie Ministra Środowiska – dopuszczalne poziomy hałasu dla zabudowy jednorodzinnej: 40 dBA (pora nocna) oraz 50 dBA (pora dzienna). Poziomy te wyznaczają granicę ochrony zdrowia ludności.',
      },
    ],
  },
  {
    id: 'wyspa-ciepla',
    title: 'Efekt wyspy ciepła (Data Heat Island)',
    icon: ThermometerSun,
    accent: 'amber',
    description: (
      <p>
        Centrum danych o mocy do 1000 MW (1 GW) to jednostka o gigantycznej skali – niemal całemu
        średniorocznemu zapotrzebowaniu na ciepło warszawskiego systemu ciepłowniczego (ok. 1100
        MW). Cała energia elektryczna pobierana przez serwery jest ostatecznie zamieniana w ciepło,
        więc obiekt stale emituje do otoczenia 1000 MW energii termicznej, wpływając na lokalny
        mikroklimat i powodując <strong>podwyższenie temperatury powietrza w promieniu kilku
        kilometrów</strong> od centrum danych.
      </p>
    ),
    sources: [
      {
        label: 'The data heat island effect – ResearchGate',
        url: 'https://www.researchgate.net/publication/403073048_The_data_heat_island_effect_quantifying_the_impact_of_AI_data_centers_in_a_warming_world',
        note: 'Badania wpływu centrów danych na wzrost lokalnej temperatury w otoczeniu.',
      },
    ],
  },
  {
    id: 'bilans-wodny',
    title: 'Bilans wodny – zużycie wody przez centrum danych (500 MW)',
    icon: Droplets,
    accent: 'cyan',
    description: (
      <div className="space-y-2">
        <p>
          Roczny pobór energii dla mocy <strong>500 MW przy pracy 24/7</strong> wynosi{' '}
          <strong>4 380 000 000 kWh (4,38 TWh)</strong>. Zużycie wody liczono dwutorowo:{' '}
          <strong>bezpośrednio</strong> – średnim wskaźnikiem WUE dla Polski{' '}
          <strong>0,21 l/kWh</strong> (chłodzenie), oraz <strong>pośrednio</strong> – wodą
          zużywaną przy produkcji energii elektrycznej, przyjmując średnie bezpowrotne zużycie dla
          elektrowni cieplnych <strong>2,5 l/kWh</strong> (zakres 1,5–4 l/kWh; elektrownie węglowe
          z chłodzeniem wieżowym tracą zazwyczaj 2,0–3,5 l/kWh).
        </p>
        <p>
          Wynik: chłodzenie bezpośrednie <strong>~919 800 m³/rok</strong>, produkcja energii{' '}
          <strong>~10 950 000 m³/rok</strong>, łącznie <strong>~11 869 800 m³/rok</strong>{' '}
          (~11,9 mld litrów). Przeciętny Polak zużywa ok. <strong>150 l wody dziennie</strong>,
          więc Bełchatów (<strong>52 331 mieszkańców</strong>) zużywa rocznie ok.{' '}
          <strong>2 865 000 m³</strong>. Centrum danych zużywa zatem ok.{' '}
          <strong>4,1 raza więcej wody</strong> niż wszyscy mieszkańcy Bełchatowa, a roczne zużycie
          miasta wystarczyłoby obiektowi na ok. <strong>2,9 miesiąca</strong> pracy.
        </p>
      </div>
    ),
    sources: [
      {
        label: 'EcoEkonomia – Europa pokazuje, jak odpowiedzialnie chłodzić centra danych',
        url: 'https://ecoekonomia.pl/europa-pokazuje-jak-odpowiedzialnie-chlodzic-centra-danych/',
        note: 'Średnie wartości wskaźnika WUE dla Polski: ok. 0,21 l/kWh.',
      },
      {
        label: 'GlobEnergia – Ile wody potrzebuje elektrownia węglowa?',
        url: 'https://globenergia.pl/ile-wody-potrzebuje-elektrownia-weglowa-to-nawet-190-l-kwh/',
        note: 'Średnie zużycie wody przy produkcji energii: 1,5–4 l/kWh; elektrownie węglowe z chłodzeniem wieżowym – bezpowrotne straty ok. 2,0–3,5 l/kWh. Do obliczeń przyjęto średnio 2,5 l/kWh.',
      },
      {
        label: 'Mojawoda.com – Średnie zużycie wody na osobę',
        url: 'https://mojawoda.com/pl/blog/poradniki/srednie-zuzycie-wody-na-osobe-w-m3-i-litrach-kalkulator-zuzycia-wody-2026',
        note: 'Przeciętny Polak zużywa ok. 150 litrów wody dziennie.',
      },
      {
        label: 'Wikipedia – Bełchatów',
        url: 'https://pl.wikipedia.org/wiki/Be%C5%82chat%C3%B3w',
        note: 'Liczba mieszkańców Bełchatowa: 52 331.',
      },
    ],
  },
  {
    id: 'bilans-energetyczny',
    title: 'Bilans energetyczny – zużycie energii elektrycznej (500 MW)',
    icon: Zap,
    accent: 'yellow',
    description: (
      <div className="space-y-2">
        <p>
          Roczny pobór energii dla mocy <strong>500 MW przy pracy 24/7</strong> wynosi{' '}
          <strong>4 380 000 000 kWh (4,38 TWh)</strong>. Według <strong>GUS (BDL, 2024)</strong>{' '}
          jeden mieszkaniec Bełchatowa zużył średnio <strong>662,7 kWh</strong>, co przy{' '}
          <strong>52 331 mieszkańcach</strong> daje ok. <strong>34 679 754 kWh (~34,7 GWh)</strong>{' '}
          rocznie.
        </p>
        <p>
          Centrum danych zużywa zatem ok. <strong>126 razy więcej energii elektrycznej</strong> niż
          wszyscy mieszkańcy Bełchatowa, a całoroczny pobór miasta wystarczyłby obiektowi na ok.{' '}
          <strong>2,9 dnia</strong> pracy. To skala porównywalna z zapotrzebowaniem dużej
          aglomeracji – istotne obciążenie krajowego systemu elektroenergetycznego.
        </p>
      </div>
    ),
    sources: [
      {
        label: 'GUS – Bank Danych Lokalnych (BDL)',
        url: 'https://bdl.stat.gov.pl/',
        note: 'Zużycie energii elektrycznej na mieszkańca Bełchatowa w 2024 r.: 662,7 kWh.',
      },
      {
        label: 'Karta Informacyjna Przedsięwzięcia (KIP)',
        note: 'Moc centrum danych: 500 MW (IT) – założenie pracy ciągłej 24/7 przez cały rok.',
      },
    ],
  },
];

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/80 bg-slate-950/95 text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">
                Metodologia & Źródła
              </h2>
              <p className="text-xs text-slate-400">
                Założenia modeli (akustyka, mikroklimat, bilans wodny i energetyczny), wpływ na zdrowie i bibliografia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => {
              const styles = accentStyles[card.accent];
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-2xl border space-y-3 ${styles.box}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${styles.icon}`}
                    >
                      <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                    </div>
                    <h4 className={`font-bold text-sm leading-snug ${styles.title}`}>
                      {card.title}
                    </h4>
                  </div>

                  <div className="text-slate-300 text-[11px] leading-relaxed space-y-2">
                    {card.description}
                  </div>

                  {card.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <Link2 className="w-3 h-3" />
                        <span>Źródła</span>
                      </div>
                      {card.sources.map((source, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                        >
                          <p className="text-slate-400 text-[11px]">{source.note}</p>
                          {source.url ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs ${styles.source} hover:underline inline-flex items-center space-x-1`}
                            >
                              <span>{source.label} ↗</span>
                            </a>
                          ) : (
                            <div className={`text-xs font-semibold ${styles.source}`}>
                              {source.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
