export class SpeedTestResultsModel {
    constructor(fileSize) {
        this.fileSize = fileSize;
        this.duration = 0;
        this.hasEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.speedBps = 0;
    }
    get speedKbps() {
        return this.speedBps / 1024;
    }
    get speedMbps() {
        return this.speedKbps / 1024;
    }
    _update() {
        if (this.endTime !== null && this.startTime !== null) {
            const milliseconds = this.endTime - this.startTime;
            if (milliseconds !== 0) {
                this.duration = milliseconds / 1000;
            }
            const bitsLoaded = this.fileSize * 8;
            this.speedBps = bitsLoaded / this.duration;
        }
    }
    end() {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = Date.now();
            this._update();
        }
    }
    error() {
        if (!this.hasEnded) {
            this.hasEnded = true;
            this.endTime = null;
            this._update();
        }
    }
    start() {
        this.startTime = Date.now();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC1yZXN1bHRzLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21vZGVscy9zcGVlZC10ZXN0LXJlc3VsdHMubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxPQUFPLHFCQUFxQjtJQU9oQyxZQUFvQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTjdCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixjQUFTLEdBQWtCLElBQUksQ0FBQztRQUNoQyxZQUFPLEdBQWtCLElBQUksQ0FBQztRQUM5QixhQUFRLEdBQVcsQ0FBQyxDQUFDO0lBRVcsQ0FBQztJQUV4QyxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFTyxPQUFPO1FBQ2IsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3JELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNuRCxJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdDLENBQUM7SUFDSCxDQUFDO0lBRUQsR0FBRztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzlCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgU3BlZWRUZXN0UmVzdWx0cyB7XHJcbiAgZHVyYXRpb246IG51bWJlcjtcclxuICBoYXNFbmRlZDogYm9vbGVhbjtcclxuICBzdGFydFRpbWU6IG51bWJlciB8IG51bGw7XHJcbiAgZW5kVGltZTogbnVtYmVyIHwgbnVsbDtcclxuICBzcGVlZEJwczogbnVtYmVyO1xyXG4gIHNwZWVkS2JwczogbnVtYmVyO1xyXG4gIHNwZWVkTWJwczogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3BlZWRUZXN0UmVzdWx0c01vZGVsIGltcGxlbWVudHMgU3BlZWRUZXN0UmVzdWx0cyB7XHJcbiAgcHVibGljIGR1cmF0aW9uOiBudW1iZXIgPSAwO1xyXG4gIHB1YmxpYyBoYXNFbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBzdGFydFRpbWU6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBlbmRUaW1lOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgc3BlZWRCcHM6IG51bWJlciA9IDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZVNpemU6IG51bWJlcikge31cclxuXHJcbiAgZ2V0IHNwZWVkS2JwcygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuc3BlZWRCcHMgLyAxMDI0O1xyXG4gIH1cclxuXHJcbiAgZ2V0IHNwZWVkTWJwcygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuc3BlZWRLYnBzIC8gMTAyNDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3VwZGF0ZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmVuZFRpbWUgIT09IG51bGwgJiYgdGhpcy5zdGFydFRpbWUgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdGhpcy5lbmRUaW1lIC0gdGhpcy5zdGFydFRpbWU7XHJcbiAgICAgIGlmIChtaWxsaXNlY29uZHMgIT09IDApIHtcclxuICAgICAgICB0aGlzLmR1cmF0aW9uID0gbWlsbGlzZWNvbmRzIC8gMTAwMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYml0c0xvYWRlZCA9IHRoaXMuZmlsZVNpemUgKiA4O1xyXG4gICAgICB0aGlzLnNwZWVkQnBzID0gYml0c0xvYWRlZCAvIHRoaXMuZHVyYXRpb247XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBlbmQoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuaGFzRW5kZWQpIHtcclxuICAgICAgdGhpcy5oYXNFbmRlZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXJyb3IoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuaGFzRW5kZWQpIHtcclxuICAgICAgdGhpcy5oYXNFbmRlZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IG51bGw7XHJcbiAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhcnQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==