import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://boasorte.teddybackoffice.com.br/users';
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  newClient(client: any): Observable<any> {
    const requestBody = {
      name: client.name,
      salary: Number(client.salary),
      companyValuation: Number(client.companyValuation),
    };
    return this.http.post<any>(this.apiUrl, requestBody, {
      headers: this.getHeaders(),
    });
  }

  updateUser(client: any): Observable<any> {
    const requestBody = {
      name: client.name,
      salary: Number(client.salary),
      companyValuation: Number(client.companyValuation),
    };

    return this.http.patch(`${this.apiUrl}/${client.id}`, requestBody, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
// https://boasorte.teddybackoffice.com.br/users/{id}
