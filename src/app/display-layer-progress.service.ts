import { Injectable } from '@angular/core';
import { Observable, Observer, timer } from 'rxjs';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DisplayLayerProgressService {

  observable: Observable<DisplayLayerProgressAPI>;

  constructor(private configService: ConfigService, private http: HttpClient) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(750, this.configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this.configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this.configService.config.octoprint.accessToken
            })
          };
          this.http.get(this.configService.config.octoprint.url + 'plugin/DisplayLayerProgress', httpHeaders).subscribe(
            (data: JSON) => {
              observer.next({
                current: data['layer']['current'] === '-' ? 0 : data['layer']['current'],
                total: data['layer']['total'] === '-' ? 0 : data['layer']['total'],
                fanSpeed: data['fanSpeed'] === '-' ? 0 : data['fanSpeed']
              })
            }, (error: HttpErrorResponse) => {
              console.error('Can\'t retrieve layerProgress! ' + error.message);
            });
        }
      });
    }).pipe(share());
  }


  public getObservable(): Observable<DisplayLayerProgressAPI> {
    return this.observable;
  }

}

export interface DisplayLayerProgressAPI {
  current: number;
  total: number;
  fanSpeed: number;
}
