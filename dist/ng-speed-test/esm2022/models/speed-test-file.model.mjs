export class SpeedTestFileModel {
    constructor(file) {
        this.path = 'https://raw.githubusercontent.com/jrquick17/ng-speed-test/02c59e4afde67c35a5ba74014b91d44b33c0b3fe/demo/src/assets/5mb.jpg';
        this.shouldBustCache = true;
        this.size = 4952221;
        if (file) {
            if (file.path !== undefined) {
                this.path = file.path;
            }
            if (file.size !== undefined) {
                this.size = file.size;
            }
            if (file.shouldBustCache !== undefined) {
                this.shouldBustCache = file.shouldBustCache;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWQtdGVzdC1maWxlLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21vZGVscy9zcGVlZC10ZXN0LWZpbGUubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsTUFBTSxPQUFPLGtCQUFrQjtJQUs3QixZQUFZLElBQTZCO1FBSmxDLFNBQUksR0FBVyw0SEFBNEgsQ0FBQztRQUM1SSxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUNoQyxTQUFJLEdBQVcsT0FBTyxDQUFDO1FBRzVCLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4QixDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDeEIsQ0FBQztZQUNELElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQzlDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBTcGVlZFRlc3RGaWxlIHtcbiAgcGF0aDogc3RyaW5nO1xuICBzaG91bGRCdXN0Q2FjaGU6IGJvb2xlYW47XG4gIHNpemU6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFNwZWVkVGVzdEZpbGVNb2RlbCBpbXBsZW1lbnRzIFNwZWVkVGVzdEZpbGUge1xuICBwdWJsaWMgcGF0aDogc3RyaW5nID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qcnF1aWNrMTcvbmctc3BlZWQtdGVzdC8wMmM1OWU0YWZkZTY3YzM1YTViYTc0MDE0YjkxZDQ0YjMzYzBiM2ZlL2RlbW8vc3JjL2Fzc2V0cy81bWIuanBnJztcbiAgcHVibGljIHNob3VsZEJ1c3RDYWNoZTogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyBzaXplOiBudW1iZXIgPSA0OTUyMjIxO1xuXG4gIGNvbnN0cnVjdG9yKGZpbGU/OiBQYXJ0aWFsPFNwZWVkVGVzdEZpbGU+KSB7XG4gICAgaWYgKGZpbGUpIHtcbiAgICAgIGlmIChmaWxlLnBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnBhdGggPSBmaWxlLnBhdGg7XG4gICAgICB9XG4gICAgICBpZiAoZmlsZS5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zaXplID0gZmlsZS5zaXplO1xuICAgICAgfVxuICAgICAgaWYgKGZpbGUuc2hvdWxkQnVzdENhY2hlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zaG91bGRCdXN0Q2FjaGUgPSBmaWxlLnNob3VsZEJ1c3RDYWNoZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==