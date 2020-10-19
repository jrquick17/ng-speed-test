# ng-speed-test #

[![npm](https://img.shields.io/npm/l/ng-speed-test.svg)](https://www.npmjs.com/package/ng-speed-test/)
[![npm](https://img.shields.io/npm/dt/ng-speed-test.svg)](https://www.npmjs.com/package/ng-speed-test)
[![npm](https://img.shields.io/npm/dm/ng-speed-test.svg)](https://www.npmjs.com/package/ng-speed-test)

![](example.gif)

## Index ##

* [About](#about)
* [Setup](#setup)
* [Usage](#usage)
* [Documentation](#documentation)
* [Contributing](#contributing)
* [Issues](#issues)
* [Deploy](#deploy)

## About ## 

A lightweight Angular 2+ service for checking internet speed  

* Try out [the demo](https://ng-speed-test.jrquick.com) to see it in action!
* Visit [my website](https://jrquick.com) for other cool projects!

## Setup ##

### Install ###

```
npm install ng-speed-test --save
```

### Import module ###

* Import `SpeedTestModule` by adding the following to your parent module (i.e. `app.module.ts`):

    ```
    import { SpeedTestModule } from 'ng-speed-test';

    @NgModule({
      ...
      imports: [
        SpeedTestModule,
        ...
      ],
      ...
    })
    export class AppModule {}
    ```
  
## Usage ##

### Check Internet Speed ###

* Checkout the demo and it's code for more examples.

```typescript
import {SpeedTestService} from 'ng-speed-test';

@Injectable()
export class TechCheckService {
  constructor(
    private speedTestService:SpeedTestService
  ) {
    this.speedTestService.getMbps().subscribe(
      (speed) => {
        console.log('Your speed is ' + speed);
      }
    );
  }
}
```

### Check Internet Speed w/ Custom Settings

```typescript
import {SpeedTestService} from 'ng-speed-test';

@Injectable()
export class TechCheckService {
  constructor(
    private speedTestService:SpeedTestService
  ) {
    this.speedTestService.getMbps(
      {
        iterations: 10,
        file: {
          path: 'my-custom-image.png',
          size: 2048
        },
        retryDelay: 1500,
      }
    ).subscribe(
      (speed) => {
        console.log('Your speed is ' + speed);
      }
    );
  }
}
```

### Check If Online ###

```typescript
import {SpeedTestService} from 'ng-speed-test';

@Injectable()
export class TechCheckService {
  constructor(
    private speedTestService:SpeedTestService
  ) {
    this.speedTestService.isOnline().subscribe(
      (isOnline) => {
        if (isOnline === false) {
          console.log('Network unavailable.');
        }
      }
    );
  }
}
```

## Documentation ##

### Functions ###

* `getBps()` - Get the current internet speed in BPS (bytes per second).
* `getKbps()` - Get the current internet speed in KBPS (kilobytes per second).
* `getMbps()` - Get the current internet speed in MBPS (megabytes per second).
* `isOnline()` - Check if the network is available.

### Settings ###

* `file` - see [File Settings (below)](#file)
* `iterations` - (default: 3) The number of speed readings to take for the average. 
Increase iterations the more accurate results, decrease iterations for faster results.
* `retryDelay` - (default: 500) The number of milliseconds to wait before the next iteration after a network error

#### File ####

* `path` - (default: ~5mb image stored on GitHub) The URL where to download an image for determining internet speed
* `size` - (default: ~5mb) The size of the image at the path (in bytes)
* `shouldBustCache` (default: true) Append GET variable to bust browser cache

## Contributing ##

### Thanks ###

* [jrquick17](https://github.com/jrquick17)

## Issues ##

If you find any issues feel free to open a request in [the Issues tab](https://github.com/jrquick17/ng-speed-test/issues). If I have the time I will try to solve any issues but cannot make any guarantees. Feel free to contribute yourself.

## Deploy ##

### Demo ###
    
* Run `npm install` to get packages required for the demo and then run `npm run demo` to run locally.

### Generate Docs ###

* Run `npm run docs:build`

#### Update Version ###
    
* Update version `package.json` files in both the root and `dist/` directory following [Semantic Versioning (2.0.0)](https://semver.org/).

### Build ###

* Run `npm run build` from root.

#### Test ####

* Copy `dist/` contents into `demo/node_modules/ng-speed-test/`
    * Run from root:  `cp -fr dist/* demo/node_modules/ng-speed-test/`
* Run `ng serve` from `demo/`
* Run `ng build --prod` from `demo/`

#### NPM Release ####

* Run `npm publish` from `dist/` directory.

#### Update Changelog ####

* Add updates to `CHANGELOG.md` in root.
