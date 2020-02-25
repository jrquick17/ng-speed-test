var SpeedDetailsModel = /** @class */ (function () {
    function SpeedDetailsModel(fileSize) {
        this.fileSize = fileSize;
    }
    SpeedDetailsModel.prototype.end = function () {
        this.endTime = (new Date()).getTime();
        this.duration = (this.endTime - this.startTime) / 1000;
        var bitsLoaded = this.fileSize * 8;
        this.speedBps = bitsLoaded / this.duration;
    };
    SpeedDetailsModel.prototype.start = function () {
        this.startTime = (new Date()).getTime();
    };
    return SpeedDetailsModel;
}());
export { SpeedDetailsModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtZGV0YWlscy5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLXNwZWVkLXRlc3QvIiwic291cmNlcyI6WyJhcHAvbW9kZWxzL3NwZWVkLWRldGFpbHMubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFNRSwyQkFDVSxRQUFlO1FBQWYsYUFBUSxHQUFSLFFBQVEsQ0FBTztJQUd6QixDQUFDO0lBRUQsK0JBQUcsR0FBSDtRQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUV2RCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQzdDLENBQUM7SUFFRCxpQ0FBSyxHQUFMO1FBQ0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBekJELElBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFNwZWVkRGV0YWlsc01vZGVsIHtcbiAgcHVibGljIGR1cmF0aW9uOm51bWJlcjtcbiAgcHVibGljIGVuZFRpbWU6bnVtYmVyO1xuICBwdWJsaWMgc3BlZWRCcHM6bnVtYmVyO1xuICBwdWJsaWMgc3RhcnRUaW1lOm51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGZpbGVTaXplOm51bWJlclxuICApIHtcblxuICB9XG5cbiAgZW5kKCk6dm9pZCB7XG4gICAgdGhpcy5lbmRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgIHRoaXMuZHVyYXRpb24gPSAodGhpcy5lbmRUaW1lIC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcblxuICAgIGNvbnN0IGJpdHNMb2FkZWQgPSB0aGlzLmZpbGVTaXplICogODtcblxuICAgIHRoaXMuc3BlZWRCcHMgPSBiaXRzTG9hZGVkIC8gdGhpcy5kdXJhdGlvbjtcbiAgfVxuXG4gIHN0YXJ0KCk6dm9pZCB7XG4gICAgdGhpcy5zdGFydFRpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICB9XG59XG4iXX0=