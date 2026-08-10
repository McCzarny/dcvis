import React from 'react';
import { X, BookOpen } from 'lucide-react';


interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/80 bg-slate-950/95 text-slate-100">
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
                Założenia modelu akustycznego, wpływ na zdrowie i bibliografia
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
              <h4 className="font-bold text-sky-300 text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Model Akustyczny – Założenia Metodologiczne</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <h5 className="font-bold text-sky-400 text-xs">Model propagacji dźwięku</h5>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Zastosowano <strong>model 1/r<sup>1,5</sup></strong> uwzględniający odbicia od gruntu i inwersje atmosferyczne. Model ten odzwierciedla rzeczywiste warunki, w których odbicia od ziemi oraz nocne inwersje temperatury „zatrzymują” dźwięk bliżej powierzchni ziemi i uginają fale z powrotem ku dołowi, co spowalnia spadek hałasu do ok. <strong>4,5 dB przy każdym podwojeniu odległości</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <h5 className="font-bold text-sky-400 text-xs">Dlaczego nie 1/r<sup>2</sup>?</h5>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Model sferyczny (1/r², spadek 6 dB na podwojenie odległości) zakłada rozchodzenie się dźwięku w idealnej, nieograniczonej przestrzeni bez przeszkód. W warunkach rzeczywistych odbicia gruntowe, inwersje termiczne i uwarstwienie atmosfery znacząco spowalniają tłumienie, prowadząc do wyższych poziomów hałasu na dużych odległościach.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
              <h4 className="font-bold text-rose-300 text-sm">Ciągły szum a tymczasowy hałas generatorów</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong>Ciągły szum wentylatorów i systemów HVAC</strong>, utrzymujący się 24 godziny na dobę, 7 dni w tygodniu, bywa <strong>znacznie bardziej uciążliwy niż okresowe testy generatorów diesla</strong>. O ile testy generatorów są intensywne, ale czasowo ograniczone (zazwyczaj raz w miesiącu), o tyle stały, nieprzerwany szum uniemożliwia jakąkolwiek adaptację i regenerację, prowadząc do przewlekłego stresu i zaburzeń snu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-3">
              <h4 className="font-bold text-purple-300 text-sm">Wpływ niskich częstotliwości (Low-Frequency Noise)</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Prezentowane wartości w skali <strong>dBA drastycznie niedoszacowują uciążliwości dźwięków o niskiej częstotliwości</strong> (poniżej 200 Hz), które są generowane przez systemy HVAC oraz agregaty prądotwórcze. Skala dBA (krzywa A) została zaprojektowana do pomiaru dźwięków o średnich częstotliwościach i nie odzwierciedla rzeczywistej uciążliwości infradźwięków i niskich tonów.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Ponieważ <strong>niskie częstotliwości nie są pochłaniane przez powietrze, drzewa ani standardowe ekrany akustyczne</strong>, rozprzestrzeniają się one niemal wyłącznie na drodze geometrycznej i mogą być wyraźnie słyszalne w odległości nawet <strong>3,2–4 km</strong> od źródła.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 space-y-3">
              <h4 className="font-bold text-indigo-300 text-sm">Wpływ na zdrowie – Przewlekła deprywacja snu</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Ciągły nocny szum uniemożliwia głęboki, regeneracyjny odpoczynek. Przewlekły brak snu u dorosłych i dzieci prowadzi do permanentnego zmęczenia, zaburzeń nastroju, a także zwiększa ryzyko wypadków komunikacyjnych i w miejscu pracy. U dzieci brak odpowiedniej ilości snu może dodatkowo zmniejszać wydzielanie hormonów wzrostu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
              <h4 className="font-bold text-amber-300 text-sm">Wpływ na temperaturę otoczenia – Efekt wyspy ciepła (Data Heat Island)</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Centrum danych o mocy do 1000 MW (1 GW) to jednostka o gigantycznej skali niemal całemu średniorocznemu zapotrzebowaniu na ciepło warszawskiego systemu ciepłowniczego (ok. 1100 MW). Ponieważ cała energia elektryczna pobierana przez serwery jest ostatecznie zamieniana w ciepło, obiekt ten stale emituje do otoczenia 1000 MW energii termicznej wpływając na lokalny mikroklimat i powodując <strong>podwyższenie temperatury powietrza w promieniu kilku kilometrów</strong> od centrum danych.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-200 text-sm">Źródła danych</h4>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400 text-xs">Hałas wentylatorów</div>
                <p className="text-slate-400 text-[11px]">
                  Poziom źródłowy: 65 dBA w odległości 500 stóp (152,4 m). Na podstawie badania akustycznego centrów danych.
                </p>
                <a
                  href="https://protectpwc.org/wp-content/uploads/2023/02/Lyver-Data-Center-Noise-Study-123122.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-500 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Lyver Data Center Noise Study (2022) ↗</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400 text-xs">Hałas silników diesla</div>
                <p className="text-slate-400 text-[11px]">
                  Poziom źródłowy: 95 dBA w odległości 7 metrów od wydechu silnika wysokoprężnego.
                </p>
                <a
                  href="https://www.decibelinternational.pl/blog/kompleksowy-przewodnik-po-d-wi-koszczelno-ci-i-optymalizacji-akustycznej-dla-centr-w-danych-6/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-500 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Decibel International – Przewodnik akustyczny dla centrów danych ↗</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400 text-xs">Niskie częstotliwości i ich wpływ na zdrowie</div>
                <p className="text-slate-400 text-[11px]">
                  Analiza wpływu hałasu niskoczęstotliwościowego generowanego przez centra danych na społeczności lokalne.
                </p>
                <a
                  href="https://static1.squarespace.com/static/59af5a537131a5b42451a91d/t/6a74a3aebc65c55b93fbbef7/1786028975013/DataCenters_BoA_LowFrequencyNoise_Fowler-Finn.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-500 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Fowler & Finn – Low Frequency Noise from Data Centers ↗</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400 text-xs">Normy hałasu w środowisku (Polska)</div>
                <p className="text-slate-400 text-[11px]">
                  Rozporządzenie Ministra Środowiska – dopuszczalne poziomy hałasu dla zabudowy jednorodzinnej: <strong>40 dBA (pora nocna)</strong> oraz <strong>50 dBA (pora dzienna)</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400 text-xs">Efekt wyspy ciepła centrów danych</div>
                <p className="text-slate-400 text-[11px]">
                  Badania wpływu centrów danych na wzrost lokalnej temperatury w otoczeniu.
                </p>
                <a
                  href="https://www.researchgate.net/publication/403073048_The_data_heat_island_effect_quantifying_the_impact_of_AI_data_centers_in_a_warming_world"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-500 hover:underline inline-flex items-center space-x-1"
                >
                  <span>The data heat island effect – ResearchGate ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
