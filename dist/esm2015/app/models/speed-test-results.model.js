export class SpeedTestResultsModel {
    constructor(fileSize) {
        this.fileSize = fileSize;
        this.duration = 0;
        this.hasEnded = false;
        this.startTime = null;
        this.endTime = null;
        this.speedBps = 0;
    }
    _update() {
        if (this.endTime !== null) {
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
            this.endTime = (new Date()).getTime();
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
        this.startTime = (new Date()).getTime();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC1yZXN1bHRzLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwcC9tb2RlbHMvc3BlZWQtdGVzdC1yZXN1bHRzLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sT0FBTyxxQkFBcUI7SUFTaEMsWUFDVSxRQUFlO1FBQWYsYUFBUSxHQUFSLFFBQVEsQ0FBTztRQVRsQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGFBQVEsR0FBVyxLQUFLLENBQUM7UUFFekIsY0FBUyxHQUFVLElBQUksQ0FBQztRQUN4QixZQUFPLEdBQVUsSUFBSSxDQUFDO1FBRXRCLGFBQVEsR0FBVSxDQUFDLENBQUM7SUFNM0IsQ0FBQztJQUVPLE9BQU87UUFDYixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNuRCxJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQzthQUNyQztZQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRUQsR0FBRztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBRXJCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFdEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUVyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUVwQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEI7SUFDSCxDQUFDO0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDMUMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFNwZWVkVGVzdFJlc3VsdHNNb2RlbCB7XG4gIHB1YmxpYyBkdXJhdGlvbjpudW1iZXIgID0gMDtcbiAgcHVibGljIGhhc0VuZGVkOmJvb2xlYW4gPSBmYWxzZTtcblxuICBwdWJsaWMgc3RhcnRUaW1lOm51bWJlciA9IG51bGw7XG4gIHB1YmxpYyBlbmRUaW1lOm51bWJlciA9IG51bGw7XG5cbiAgcHVibGljIHNwZWVkQnBzOm51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBmaWxlU2l6ZTpudW1iZXJcbiAgKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZSgpOnZvaWQge1xuICAgIGlmICh0aGlzLmVuZFRpbWUgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IHRoaXMuZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lO1xuICAgICAgaWYgKG1pbGxpc2Vjb25kcyAhPT0gMCkge1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gbWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYml0c0xvYWRlZCA9IHRoaXMuZmlsZVNpemUgKiA4O1xuXG4gICAgICB0aGlzLnNwZWVkQnBzID0gYml0c0xvYWRlZCAvIHRoaXMuZHVyYXRpb247XG4gICAgfVxuICB9XG5cbiAgZW5kKCk6dm9pZCB7XG4gICAgaWYgKCF0aGlzLmhhc0VuZGVkKSB7XG4gICAgICB0aGlzLmhhc0VuZGVkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5lbmRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZXJyb3IoKTp2b2lkIHtcbiAgICBpZiAoIXRoaXMuaGFzRW5kZWQpIHtcbiAgICAgIHRoaXMuaGFzRW5kZWQgPSB0cnVlO1xuXG4gICAgICB0aGlzLmVuZFRpbWUgPSBudWxsO1xuXG4gICAgICB0aGlzLl91cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpOnZvaWQge1xuICAgIHRoaXMuc3RhcnRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgfVxufVxuIl19