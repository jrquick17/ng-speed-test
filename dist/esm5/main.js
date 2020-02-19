import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpeedTestService } from './services/speed-test.service';
export * from './services/speed-test.service';
var NgSpeedTestModule = /** @class */ (function () {
    function NgSpeedTestModule() {
    }
    NgSpeedTestModule_1 = NgSpeedTestModule;
    NgSpeedTestModule.forRoot = function () {
        return {
            ngModule: NgSpeedTestModule_1,
            providers: []
        };
    };
    var NgSpeedTestModule_1;
    NgSpeedTestModule = NgSpeedTestModule_1 = tslib_1.__decorate([
        NgModule({
            providers: [
                SpeedTestService
            ],
            imports: [
                CommonModule,
                FormsModule
            ]
        })
    ], NgSpeedTestModule);
    return NgSpeedTestModule;
}());
export { NgSpeedTestModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLXNwZWVkLXRlc3QvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUM1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBRS9ELGNBQWMsK0JBQStCLENBQUM7QUFXOUM7SUFBQTtJQU9BLENBQUM7MEJBUFksaUJBQWlCO0lBQ3JCLHlCQUFPLEdBQWQ7UUFDRSxPQUFPO1lBQ0wsUUFBUSxFQUFFLG1CQUFpQjtZQUMzQixTQUFTLEVBQUUsRUFBRTtTQUNkLENBQUM7SUFDSixDQUFDOztJQU5VLGlCQUFpQjtRQVQ3QixRQUFRLENBQUM7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsZ0JBQWdCO2FBQ2pCO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLFlBQVk7Z0JBQ1osV0FBVzthQUNaO1NBQ0YsQ0FBQztPQUNXLGlCQUFpQixDQU83QjtJQUFELHdCQUFDO0NBQUEsQUFQRCxJQU9DO1NBUFksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVyc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7Rm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHtTcGVlZFRlc3RTZXJ2aWNlfSBmcm9tICcuL3NlcnZpY2VzL3NwZWVkLXRlc3Quc2VydmljZSc7XG5cbmV4cG9ydCAqIGZyb20gJy4vc2VydmljZXMvc3BlZWQtdGVzdC5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgU3BlZWRUZXN0U2VydmljZVxuICBdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIEZvcm1zTW9kdWxlXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgTmdTcGVlZFRlc3RNb2R1bGUge1xuICBzdGF0aWMgZm9yUm9vdCgpOk1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogTmdTcGVlZFRlc3RNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtdXG4gICAgfTtcbiAgfVxufVxuIl19