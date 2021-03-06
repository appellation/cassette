import { SearchType } from '../core/Playlist';
import Song from '../core/Song';
import { IFetchable } from './IFetchable';

export interface IService {
  search: boolean;
  fetch(fetchable: IFetchable, searchType: SearchType): Promise<Song[]>;
  fetchable(content: string): IFetchable;
}
