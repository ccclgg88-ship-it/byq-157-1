import * as THREE from 'three';

export class LightingSystem {
  public group: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private hemisphereLight: THREE.HemisphereLight;
  private deskLight: THREE.SpotLight;
  private isNight: boolean = false;
  private transitionProgress: number = 1;
  private transitionDuration: number = 2;
  private isTransitioning: boolean = false;
  private targetIsNight: boolean = false;

  private dayParams = {
    ambientIntensity: 0.6,
    directionalIntensity: 1.0,
    hemisphereIntensity: 0.8,
    deskIntensity: 0,
    ambientColor: 0xfff8dc,
    directionalColor: 0xffffff,
    skyColor: 0x87ceeb,
    groundColor: 0xd4a574,
  };

  private nightParams = {
    ambientIntensity: 0.15,
    directionalIntensity: 0.1,
    hemisphereIntensity: 0.2,
    deskIntensity: 2.0,
    ambientColor: 0x1a1a2e,
    directionalColor: 0x2d2d44,
    skyColor: 0x1a1a2e,
    groundColor: 0x2d2d44,
  };

  constructor() {
    this.group = new THREE.Group();

    this.ambientLight = new THREE.AmbientLight(
      this.dayParams.ambientColor,
      this.dayParams.ambientIntensity
    );
    this.group.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(
      this.dayParams.directionalColor,
      this.dayParams.directionalIntensity
    );
    this.directionalLight.position.set(5, 10, 7);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.group.add(this.directionalLight);

    this.hemisphereLight = new THREE.HemisphereLight(
      this.dayParams.skyColor,
      this.dayParams.groundColor,
      this.dayParams.hemisphereIntensity
    );
    this.group.add(this.hemisphereLight);

    this.deskLight = new THREE.SpotLight(0xffd700, this.dayParams.deskIntensity);
    this.deskLight.position.set(-3, 3.5, -3);
    this.deskLight.angle = Math.PI / 6;
    this.deskLight.penumbra = 0.3;
    this.deskLight.decay = 2;
    this.deskLight.distance = 15;
    this.deskLight.castShadow = true;
    this.group.add(this.deskLight);

    const deskTarget = new THREE.Object3D();
    deskTarget.position.set(-3, 0, -3);
    this.group.add(deskTarget);
    this.deskLight.target = deskTarget;
  }

  public toggleDayNight(): void {
    this.targetIsNight = !this.isNight;
    this.isTransitioning = true;
    this.transitionProgress = 0;
  }

  public setNight(isNight: boolean): void {
    if (this.isNight !== isNight) {
      this.targetIsNight = isNight;
      this.isTransitioning = true;
      this.transitionProgress = 0;
    }
  }

  public update(deltaTime: number): void {
    if (this.isTransitioning) {
      this.transitionProgress += deltaTime / this.transitionDuration;
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
        this.isNight = this.targetIsNight;
      }

      const t = this.easeInOutCubic(this.transitionProgress);
      const from = this.isNight ? this.nightParams : this.dayParams;
      const to = this.targetIsNight ? this.nightParams : this.dayParams;

      this.ambientLight.intensity = this.lerp(from.ambientIntensity, to.ambientIntensity, t);
      this.directionalLight.intensity = this.lerp(from.directionalIntensity, to.directionalIntensity, t);
      this.hemisphereLight.intensity = this.lerp(from.hemisphereIntensity, to.hemisphereIntensity, t);
      this.deskLight.intensity = this.lerp(from.deskIntensity, to.deskIntensity, t);

      this.ambientLight.color.lerpColors(
        new THREE.Color(from.ambientColor),
        new THREE.Color(to.ambientColor),
        t
      );
      this.directionalLight.color.lerpColors(
        new THREE.Color(from.directionalColor),
        new THREE.Color(to.directionalColor),
        t
      );
      this.hemisphereLight.color.lerpColors(
        new THREE.Color(from.skyColor),
        new THREE.Color(to.skyColor),
        t
      );
      this.hemisphereLight.groundColor.lerpColors(
        new THREE.Color(from.groundColor),
        new THREE.Color(to.groundColor),
        t
      );
    }
  }

  public getIsNight(): boolean {
    return this.targetIsNight;
  }

  public getIsTransitioning(): boolean {
    return this.isTransitioning;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
