import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kellerei, PaginatedResponse } from '../models/kellerei.model';
import { WineAward } from '../models/wine-award.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://tourism.api.opendatahub.com/v1';

  constructor(private http: HttpClient) {}

  getKellereien(pagenumber: number = 1, pagesize: number = 20): Observable<PaginatedResponse<Kellerei>> {
    const params = new HttpParams()
      .set('source', 'suedtirolwein')
      .set('pagenumber', pagenumber.toString())
      .set('pagesize', pagesize.toString());

    return this.http.get<PaginatedResponse<Kellerei>>(`${this.baseUrl}/ODHActivityPoi`, { params });
  }

  getKellereiById(id: string): Observable<Kellerei> {
    return this.http.get<Kellerei>(`${this.baseUrl}/ODHActivityPoi/${id}`);
  }

  getWineAwards(pagenumber: number = 1, pagesize: number = 25): Observable<PaginatedResponse<WineAward>> {
    const params = new HttpParams()
      .set('pagenumber', pagenumber.toString())
      .set('pagesize', pagesize.toString());

    return this.http.get<PaginatedResponse<WineAward>>(`${this.baseUrl}/WineAward`, { params });
  }
}
