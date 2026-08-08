import React, { useState } from 'react';
import { X, FileText, AlertTriangle, ShieldCheck, Zap, Droplets, Landmark, ExternalLink } from 'lucide-react';
import { DATA_CENTER_SPECS } from '../data/layersRegistry';

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'specs' | 'offices' | 'threats' | 'global'>('status');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/80">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">
                Raport i Dokumentacja Projektu Data Center Domiechowice
              </h2>
              <p className="text-xs text-slate-400">
                Oficjalne decyzje urzędowe, parametry techniczne i ocena oddziaływania na środowisko (OOŚ)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center space-x-1 px-6 pt-3 bg-slate-900/40 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2.5 rounded-t-xl font-bold flex items-center space-x-1.5 border-t border-x transition-all ${
              activeTab === 'status'
                ? 'bg-slate-900 text-rose-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Aktualny Status OOŚ</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-2.5 rounded-t-xl font-bold flex items-center space-x-1.5 border-t border-x transition-all ${
              activeTab === 'specs'
                ? 'bg-slate-900 text-cyan-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Parametry Techniczne</span>
          </button>

          <button
            onClick={() => setActiveTab('offices')}
            className={`px-3.5 py-2.5 rounded-t-xl font-bold flex items-center space-x-1.5 border-t border-x transition-all ${
              activeTab === 'offices'
                ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Stanowiska Urzędów</span>
          </button>

          <button
            onClick={() => setActiveTab('threats')}
            className={`px-3.5 py-2.5 rounded-t-xl font-bold flex items-center space-x-1.5 border-t border-x transition-all ${
              activeTab === 'threats'
                ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Zagrożenia Lokalne</span>
          </button>

          <button
            onClick={() => setActiveTab('global')}
            className={`px-3.5 py-2.5 rounded-t-xl font-bold flex items-center space-x-1.5 border-t border-x transition-all ${
              activeTab === 'global'
                ? 'bg-slate-900 text-purple-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kontekst Światowy</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Postępowanie w sprawie decyzji środowiskowej ZAWIESZONE</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">
                  Postępowanie w sprawie wydania decyzji o środowiskowych uwarunkowaniach zostało <strong>zawieszone postanowieniem z dnia 27 maja 2026 r.</strong> do czasu aż inwestor nie przedłoży pełnego <strong>Raportu o oddziaływaniu przedsięwzięcia na środowisko (OOŚ)</strong>.
                </p>
                <div className="text-slate-400 text-[11px] pt-1">
                  Wójt Gminy Bełchatów ustalił szczegółowy zakres tego raportu w dniu 14 maja 2026 r. Inwestycja znajduje się obecnie w fazie koncepcyjnej, a fizyczne prace budowlane nie zostały rozpoczęte.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-200">Inwestor i Podmiot Napędzający</h4>
                  <p className="text-slate-300">
                    <strong>Data Center Bełchatów Sp. z o.o.</strong> powiązany z <strong>Next DC Sp. z o.o.</strong> (polski kapitał).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-200">Lokalizacja i Tytuł Prawny</h4>
                  <p className="text-slate-300">
                    Domiechowice, Gmina Bełchatów. Obejmuje 71 działek ewidencyjnych o powierzchni <strong>52,6016 ha</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Szacowana moc obliczeniowa IT:</div>
                  <div className="text-xl font-black text-amber-400 mt-1">~500 MW</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ogromna moc obliczeniowa przeznaczona pod systemy AI i hyperscale cloud.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Zasilanie awaryjne (Agregaty):</div>
                  <div className="text-xl font-black text-rose-400 mt-1">~720 MW</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ponad 100 planowanych agregatów prądotwórczych o łącznej mocy 720 MW.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Sumaryczna moc cieplna (w paliwie):</div>
                  <div className="text-xl font-black text-cyan-400 mt-1">&gt; 300 MWt</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Kwalifikacja inwestycji jako zawsze znacząco oddziałującej na środowisko.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Magazynowanie paliw:</div>
                  <div className="text-lg font-bold text-slate-200 mt-1">7 500 – 13 000 m³</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Zbiorniki paliwa Diesel / HVO pod zasilanie rezerwowe generatorów.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Wskaźnik zabudowy:</div>
                  <div className="text-lg font-bold text-slate-200 mt-1">Ok. 80% terenu</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Zabudowane lub utwardzone. Min. 20% pow. biologicznie czynnej.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Zapotrzebowanie na wodę:</div>
                  <div className="text-lg font-bold text-cyan-300 mt-1">Pobór technologiczny</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Wody podziemne czwartorzędu (głębokość 2-10 m, wydajność ujęć do 80 m³/h).
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offices' && (
            <div className="space-y-3">
              <p className="text-slate-300">
                Wszystkie powołane instancje urzędowe zgodnie stwierdziły konieczność przeprowadzenia pełnej procedury <strong>oceny oddziaływania na środowisko (OOŚ)</strong>:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-cyan-400">Wójt Gminy Bełchatów:</span>
                  <p className="text-slate-300 mt-1">
                    Nakazał sporządzenie pełnego raportu OOŚ i ustalił jego rygorystyczny zakres w postanowieniu z maja 2026 r.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-emerald-400">Marszałek Województwa Łódzkiego:</span>
                  <p className="text-slate-300 mt-1">
                    Wskazał na konieczność szczegółowej analizy wpływu na krajobraz w kontekście bezpośredniego sąsiedztwa <strong>Obszaru Chronionego Krajobrazu „Dolina Widawki”</strong> oraz uzyskania pozwolenia zintegrowanego.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-amber-400">RDOŚ w Łodzi:</span>
                  <p className="text-slate-300 mt-1">
                    Postanowił o konieczności całorocznej inwentaryzacji przyrodniczej (min. dwie wizyty wiosną i dwie latem) oraz szczegółowej analizy efektu bariery ekologicznej.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-rose-400">Państwowy Powiatowy Inspektor Sanitarny (Sanepid):</span>
                  <p className="text-slate-300 mt-1">
                    Uznał sporządzenie raportu za bezwzględnie zasadne, kładąc nacisk na skrupulatną analizę hałasu ciągłego i emisji spalin.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-blue-400">Wody Polskie (RZGW):</span>
                  <p className="text-slate-300 mt-1">
                    Wymagają precyzyjnego opisu wpływu na cele środowiskowe wód podziemnych i powierzchniowych oraz pełnego bilansu wód opadowych i ścieków technologicznych.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-rose-400">Wpływ na Krajobraz i Przyrodę</h4>
                  <p className="text-slate-300">
                    Radykalna zmiana terenu z rolniczego na przemysłowy w otulinie Obszaru Chronionego Krajobrazu Doliny Widawki.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-amber-400">Bariera Ekologiczna</h4>
                  <p className="text-slate-300">
                    Ograniczenie migracji zwierząt generowane przez bryły budynków, ogrodzenia, całodobowe oświetlenie oraz permanentny hałas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-orange-400">Magazyny Paliw i Wycieki</h4>
                  <p className="text-slate-300">
                    Ryzyko poważnych awarii przy magazynowaniu 7 500 – 13 000 m³ paliwa Diesel/HVO dla 100+ generatorów.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-cyan-400">Gospodarka Ściekowa & Woda</h4>
                  <p className="text-slate-300">
                    Potencjalne ścieki przemysłowe z systemów chłodzenia oraz presja na czwartorzędowe poziomy wodonośne (10-20 m).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'global' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                <h4 className="font-bold text-purple-300 text-sm">
                  Globalny Kontekst Wpływu Infrastruktury AI i Centrów Danych
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Centra danych na świecie zużyły w 2025 r. ponad <strong>448 TWh energii</strong> (11. miejsce na świecie, gdyby były państwem). Do 2030 r. prognozuje się wzrost do <strong>945 TWh</strong> oraz ślad wodny AI rzędu 9,3 biliona litrów wody.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-slate-200">Ślad E-Odpadów:</div>
                  <p className="text-slate-400 mt-1">
                    Do 2030 r. infrastruktura AI wygeneruje 2,5 mln ton elektroodpadów rocznie (odpowiednik 250 Wież Eiffla).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-slate-200">Paradoks Jevonsa:</div>
                  <p className="text-slate-400 mt-1">
                    Zwiększenie wydajności modeli AI nie obniża całkowitego zużycia energii – stymuluje jedynie wyższą liczbę zastosowań.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
