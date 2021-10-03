import * as THREE from 'three'

export default class SmoothedPoint {
    private smoothedPoint: THREE.Vector2
    private targetPoint: THREE.Vector2
    private speed: THREE.Vector2

    constructor(speed: THREE.Vector2, initialPos: THREE.Vector2) {
        this.smoothedPoint = initialPos.clone()
        this.targetPoint = initialPos.clone()
        this.speed = speed
    }

    public setTarget({ x, y }: { x: number; y: number }): void {
        this.targetPoint.set(x, y)
    }

    public Smooth(): void {
        this.smoothedPoint.set(
            this.smoothedPoint.x + (this.targetPoint.x - this.smoothedPoint.x) * this.speed.x,
            this.smoothedPoint.y + (this.targetPoint.y - this.smoothedPoint.y) * this.speed.y,
        )
    }

    public getPoint(): THREE.Vector2 {
        return this.smoothedPoint.clone()
    }
}
