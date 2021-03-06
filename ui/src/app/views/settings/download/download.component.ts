import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { DownloadableResource } from 'app/model/download.model';
import { environment } from '../../../../environments/environment';
import { DownloadService } from '../../../service/download/download.service';
import { PathItem } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-download',
    templateUrl: './download.html',
    styleUrls: ['./download.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent {
    resources: Array<DownloadableResource>;
    loading = false;
    apiURL: string;
    path: Array<PathItem>;

    constructor(private _downloadService: DownloadService, private _cd: ChangeDetectorRef) {
        this.loading = true;

        this._downloadService.getDownloads().subscribe(r => {
            this.resources = r;
            this.apiURL = environment.apiURL;
            this.loading = false;
            this._cd.markForCheck();
        });

        this.path = [<PathItem>{
            translate: 'common_settings'
        }, <PathItem>{
            translate: 'downloads_title'
        }];
    }
}
