import type { AnforderungenUndRandbedingungen, Annahmen, EntscheidungenUndLoesungswege, ErgebnisseUndGrenzen, Regeln } from './app';

export type EnrichedAnforderungenUndRandbedingungen = AnforderungenUndRandbedingungen & {
  vorgangName: string;
};

export type EnrichedEntscheidungenUndLoesungswege = EntscheidungenUndLoesungswege & {
  vorgangName: string;
  anforderungName: string;
};

export type EnrichedErgebnisseUndGrenzen = ErgebnisseUndGrenzen & {
  vorgangName: string;
  entscheidungName: string;
};

export type EnrichedAnnahmen = Annahmen & {
  vorgangName: string;
  stuetzendes_ergebnisName: string;
};

export type EnrichedRegeln = Regeln & {
  vorgangName: string;
  entscheidungName: string;
  ergebnisName: string;
  annahmeName: string;
};
