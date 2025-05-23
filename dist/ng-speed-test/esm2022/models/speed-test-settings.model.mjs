import { SpeedTestFileModel } from './speed-test-file.model';
export class SpeedTestSettingsModel {
    constructor(settings) {
        this.iterations = 3;
        this.file = new SpeedTestFileModel();
        this.retryDelay = 500;
        if (settings) {
            Object.assign(this, settings);
            if (settings.file) {
                this.file = new SpeedTestFileModel(settings.file);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC1zZXR0aW5ncy5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tb2RlbHMvc3BlZWQtdGVzdC1zZXR0aW5ncy5tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWdCLGtCQUFrQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFRMUUsTUFBTSxPQUFPLHNCQUFzQjtJQUtqQyxZQUFZLFFBQXFDO1FBSjFDLGVBQVUsR0FBWSxDQUFDLENBQUM7UUFDeEIsU0FBSSxHQUF3QixJQUFJLGtCQUFrQixFQUFFLENBQUM7UUFDckQsZUFBVSxHQUFZLEdBQUcsQ0FBQztRQUcvQixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUIsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NwZWVkVGVzdEZpbGUsIFNwZWVkVGVzdEZpbGVNb2RlbH0gZnJvbSAnLi9zcGVlZC10ZXN0LWZpbGUubW9kZWwnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTcGVlZFRlc3RTZXR0aW5ncyB7XHJcbiAgaXRlcmF0aW9ucz86IG51bWJlcjtcclxuICBmaWxlPzogU3BlZWRUZXN0RmlsZTtcclxuICByZXRyeURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3BlZWRUZXN0U2V0dGluZ3NNb2RlbCBpbXBsZW1lbnRzIFNwZWVkVGVzdFNldHRpbmdzIHtcclxuICBwdWJsaWMgaXRlcmF0aW9ucz86IG51bWJlciA9IDM7XHJcbiAgcHVibGljIGZpbGU/OiBTcGVlZFRlc3RGaWxlTW9kZWwgPSBuZXcgU3BlZWRUZXN0RmlsZU1vZGVsKCk7XHJcbiAgcHVibGljIHJldHJ5RGVsYXk/OiBudW1iZXIgPSA1MDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzPzogUGFydGlhbDxTcGVlZFRlc3RTZXR0aW5ncz4pIHtcclxuICAgIGlmIChzZXR0aW5ncykge1xyXG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHNldHRpbmdzKTtcclxuICAgICAgaWYgKHNldHRpbmdzLmZpbGUpIHtcclxuICAgICAgICB0aGlzLmZpbGUgPSBuZXcgU3BlZWRUZXN0RmlsZU1vZGVsKHNldHRpbmdzLmZpbGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==