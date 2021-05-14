import { Component, forwardRef } from '@angular/core';
import { MediaInput } from './media-input';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'van-video',
  templateUrl: './video.component.html',
  styleUrls: ['media-input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VideoComponent),
      multi: true
    }
  ]
})
export class VideoComponent extends MediaInput {
  /**
   * 移除视频
   */
  removeFile(files: NzUploadFile[], index: any): void {
    files.splice(index, 1);
    this.updateValue();
  }
}
