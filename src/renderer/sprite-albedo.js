/**
 * sprite-albedo.js — 雅儿贝德2D角色（原作设定版本）
 * 
 * 参考：Overlord动画/轻小说官方设定 + duitang粉丝艺术
 * 特征：姬发式黑长直、金色竖瞳、纯白紧身胸衣+多层纱裙、左肩甲、腰际黑翼、金色蛛网项圈
 * 
 * 分层绘制顺序（从后到前）：
 *   后发 → 黑翼 → 身体/胸衣 → 手臂 → 裙摆 → 前发 → 面部五官 → 犄角 → 配饰
 */
export class AlbedoSprite {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.scale = 1;

    // 动画参数
    this.bodyBob = 0;
    this.headTilt = 0;
    this.wingFlap = 0;
    this.blinkProgress = 0;
    this.blushAlpha = 0;
    this.hairSway = 0;
    this.skirtSway = 0;
    this.eyeFollowX = 0;
    this.eyeFollowY = 0;
    this.isSurprised = false;
    this.isDragging = false;
    this.speechText = '';
    this.speechTimer = 0;
  }

  draw(ctx, width, height) {
    const cx = width / 2 + this.x;
    const cy = height / 2 + this.y + 20;
    const s = this.scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);

    // 从后到前绘制
    this.drawShadow(ctx);
    this.drawBackHair(ctx);
    this.drawWings(ctx);
    this.drawBody(ctx);
    this.drawArms(ctx);
    this.drawSkirt(ctx);
    this.drawLegs(ctx);
    this.drawHead(ctx);
    this.drawFace(ctx);
    this.drawFrontHair(ctx);
    this.drawHorns(ctx);
    this.drawAccessories(ctx);

    ctx.restore();

    if (this.speechTimer > 0) {
      this.drawSpeechBubble(ctx, width, height);
    }
  }

  // ================================================================
  //  SHADOW
  // ================================================================
  drawShadow(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(0, 195 + bob, 60, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ================================================================
  //  BACK HAIR (长发瀑布)
  // ================================================================
  drawBackHair(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    const sway = Math.sin(this.hairSway) * 0.6;

    ctx.save();
    ctx.translate(0, bob - 60);

    // 主发——及腰直发，微微内扣
    const hairGrad = ctx.createLinearGradient(0, -30, 0, 140);
    hairGrad.addColorStop(0, '#1a1a2e');
    hairGrad.addColorStop(0.3, '#141428');
    hairGrad.addColorStop(0.6, '#0f0f20');
    hairGrad.addColorStop(1, '#0a0a18');
    ctx.fillStyle = hairGrad;

    ctx.beginPath();
    // 头顶
    ctx.moveTo(-22, -20);
    ctx.quadraticCurveTo(-24, 10, -23 + sway, 40);
    // 左侧下垂
    ctx.quadraticCurveTo(-22 + sway, 80, -20 + sway * 1.2, 120);
    ctx.quadraticCurveTo(-16 + sway, 135, -5, 140);
    // 发尾
    ctx.quadraticCurveTo(0, 142, 5, 140);
    ctx.quadraticCurveTo(16 + sway, 135, 20 + sway * 1.2, 120);
    // 右侧下垂
    ctx.quadraticCurveTo(22 + sway, 80, 23 + sway, 40);
    ctx.quadraticCurveTo(24, 10, 22, -20);
    ctx.quadraticCurveTo(15, -10, 0, -15);
    ctx.quadraticCurveTo(-15, -10, -22, -20);
    ctx.fill();

    // 发丝光泽（深紫蓝色高光带）
    ctx.fillStyle = 'rgba(50, 45, 80, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.quadraticCurveTo(-6 + sway * 0.5, 55, -5 + sway * 0.5, 100);
    ctx.quadraticCurveTo(0, 108, 5 + sway * 0.5, 100);
    ctx.quadraticCurveTo(6 + sway * 0.5, 55, 8, 10);
    ctx.quadraticCurveTo(0, 6, -8, 10);
    ctx.fill();

    ctx.restore();
  }

  // ================================================================
  //  WINGS (腰部黑翼)
  // ================================================================
  drawWings(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    const flap = Math.sin(this.wingFlap) * 4;

    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * 38, -5 + bob);
      ctx.rotate(side * (0.12 - flap * 0.008));

      // 主翼面
      const wingGrad = ctx.createLinearGradient(0, 0, -side * 60, -50);
      wingGrad.addColorStop(0, '#1a0a2e');
      wingGrad.addColorStop(0.4, '#150828');
      wingGrad.addColorStop(0.8, '#2a1040');
      wingGrad.addColorStop(1, '#1a0828');
      ctx.fillStyle = wingGrad;

      ctx.beginPath();
      ctx.moveTo(0, -5);
      // 上弧
      ctx.quadraticCurveTo(-side * 25, -40, -side * 55, -65);
      ctx.quadraticCurveTo(-side * 50, -70, -side * 45, -75);
      // 翼尖
      ctx.quadraticCurveTo(-side * 40, -80, -side * 30, -68);
      // 下弧
      ctx.quadraticCurveTo(-side * 35, -40, -side * 20, -5);
      ctx.quadraticCurveTo(-side * 15, -2, 0, -5);
      ctx.fill();

      // 翼骨线
      ctx.strokeStyle = 'rgba(60, 25, 90, 0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const t = 0.2 + i * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.quadraticCurveTo(
          -side * (20 + i * 8), -20 - i * 12,
          -side * (45 + i * 3), -55 - i * 6
        );
        ctx.stroke();
      }

      // 羽根深紫微光
      ctx.fillStyle = 'rgba(80, 30, 120, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(-side * 15, -25, -side * 30, -45);
      ctx.quadraticCurveTo(-side * 20, -38, 0, -28);
      ctx.quadraticCurveTo(-side * 5, -18, 0, -5);
      ctx.fill();

      ctx.restore();
    });
  }

  // ================================================================
  //  BODY (紧身胸衣 + 高领)
  // ================================================================
  drawBody(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;

    ctx.save();
    ctx.translate(0, bob);

    // 躯干底色
    ctx.fillStyle = '#fff5ee';
    ctx.beginPath();
    ctx.moveTo(-12, -58);
    ctx.lineTo(-14, 25);
    ctx.quadraticCurveTo(-10, 30, 0, 32);
    ctx.quadraticCurveTo(10, 30, 14, 25);
    ctx.lineTo(12, -58);
    ctx.closePath();
    ctx.fill();

    // 紧身胸衣（白色，高领设计）
    const dressGrad = ctx.createLinearGradient(-20, -60, 20, -60);
    dressGrad.addColorStop(0, '#f2edf5');
    dressGrad.addColorStop(0.3, '#ffffff');
    dressGrad.addColorStop(0.7, '#faf7fc');
    dressGrad.addColorStop(1, '#ede4f2');
    ctx.fillStyle = dressGrad;

    // 胸衣主体
    ctx.beginPath();
    ctx.moveTo(-24, -60);
    ctx.quadraticCurveTo(-26, -30, -22, 0);
    ctx.quadraticCurveTo(-18, 18, -20, 28);
    ctx.lineTo(20, 28);
    ctx.quadraticCurveTo(18, 18, 22, 0);
    ctx.quadraticCurveTo(26, -30, 24, -60);
    ctx.quadraticCurveTo(0, -68, -24, -60);
    ctx.fill();

    // 胸衣轮廓
    ctx.strokeStyle = 'rgba(180, 170, 190, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 高领
    ctx.fillStyle = '#faf7fc';
    ctx.beginPath();
    ctx.moveTo(-12, -62);
    ctx.quadraticCurveTo(-14, -72, -10, -78);
    ctx.lineTo(10, -78);
    ctx.quadraticCurveTo(14, -72, 12, -62);
    ctx.quadraticCurveTo(8, -68, 0, -70);
    ctx.quadraticCurveTo(-8, -68, -12, -62);
    ctx.fill();

    // 金色领边
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, -78);
    ctx.quadraticCurveTo(0, -74, 12, -78);
    ctx.stroke();

    // === 胸部金色蛛网装饰 ===
    // 弧形金边
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-18, -50);
    ctx.quadraticCurveTo(0, -60, 18, -50);
    ctx.stroke();

    // 蛛网纹——中心宝石
    const gemGrad = ctx.createRadialGradient(0, -35, 1, 0, -35, 7);
    gemGrad.addColorStop(0, '#ee55ff');
    gemGrad.addColorStop(0.4, '#9900cc');
    gemGrad.addColorStop(0.8, '#550080');
    gemGrad.addColorStop(1, '#330050');
    ctx.fillStyle = gemGrad;
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.bezierCurveTo(6, -36, 6, -28, 0, -24);
    ctx.bezierCurveTo(-6, -28, -6, -36, 0, -42);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 蛛网放射线
    ctx.strokeStyle = 'rgba(230, 192, 64, 0.5)';
    ctx.lineWidth = 0.6;
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, -33);
      ctx.lineTo(Math.cos(angle) * 12, -33 + Math.sin(angle) * 10);
      ctx.stroke();
    }
    // 蛛网环
    ctx.beginPath();
    ctx.arc(0, -33, 7, 0, Math.PI * 2);
    ctx.stroke();

    // === 腰部金色链 ===
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-18, 15);
    ctx.quadraticCurveTo(0, 10, 18, 15);
    ctx.stroke();

    // 腰链蛛网徽章
    ctx.fillStyle = '#e6c040';
    ctx.beginPath();
    ctx.arc(0, 13, 5, 0, Math.PI * 2);
    ctx.fill();
    // 蛛网腿
    ctx.strokeStyle = '#c0a030';
    ctx.lineWidth = 0.5;
    for (let a = 0; a < 8; a++) {
      const angle = a * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.lineTo(Math.cos(angle) * 8, 13 + Math.sin(angle) * 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ================================================================
  //  ARMS (手臂 + 左肩甲)
  // ================================================================
  drawArms(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;

    ctx.save();
    ctx.translate(0, bob);

    // === 左臂 ===
    ctx.fillStyle = '#fff0e0';
    ctx.beginPath();
    ctx.roundRect(-28, -55, 10, 50, 5);
    ctx.fill();

    // 左手
    ctx.fillStyle = '#fff5ee';
    ctx.beginPath();
    ctx.arc(-23, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // === 左肩甲（仅左侧！原作设定） ===
    ctx.fillStyle = '#f8f6fa';
    ctx.beginPath();
    ctx.moveTo(-32, -56);
    ctx.quadraticCurveTo(-46, -50, -42, -38);
    ctx.quadraticCurveTo(-36, -35, -26, -38);
    ctx.quadraticCurveTo(-24, -46, -32, -56);
    ctx.fill();

    // 肩甲金色滚边
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-32, -56);
    ctx.quadraticCurveTo(-46, -50, -42, -38);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-42, -38);
    ctx.quadraticCurveTo(-36, -35, -26, -38);
    ctx.stroke();

    // 肩甲暗紫宝石
    ctx.fillStyle = '#660099';
    ctx.beginPath();
    ctx.arc(-34, -46, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180, 80, 220, 0.5)';
    ctx.beginPath();
    ctx.arc(-35, -47, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // === 右臂（无肩甲） ===
    ctx.fillStyle = '#fff0e0';
    ctx.beginPath();
    ctx.roundRect(18, -55, 10, 50, 5);
    ctx.fill();

    // 右手
    ctx.fillStyle = '#fff5ee';
    ctx.beginPath();
    ctx.arc(23, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // 手指
    ctx.strokeStyle = 'rgba(200, 170, 150, 0.3)';
    ctx.lineWidth = 0.4;
    for (const hx of [-23, 23]) {
      for (let fi = -2; fi <= 1; fi++) {
        ctx.beginPath();
        ctx.moveTo(hx, -2);
        ctx.lineTo(hx + fi * 1.5, -7);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ================================================================
  //  SKIRT (多层纱裙摆)
  // ================================================================
  drawSkirt(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    const sway = Math.sin(this.skirtSway) * 1.5;

    ctx.save();
    ctx.translate(0, bob + 22);

    // 裙撑（最内层，白色衬裙）
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(-22 + sway * 0.3, 8, -24 + sway * 0.3, 18);
    ctx.lineTo(24 + sway * 0.3, 18);
    ctx.quadraticCurveTo(22 + sway * 0.3, 8, 14, 0);
    ctx.closePath();
    ctx.fill();

    // 第2层缎面主裙（前短后长）
    ctx.fillStyle = '#faf5fb';
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(-28 + sway * 0.5, 14, -30 + sway * 0.5, 30);
    ctx.lineTo(30 + sway * 0.5, 30);
    ctx.quadraticCurveTo(28 + sway * 0.5, 14, 16, 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 190, 210, 0.3)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 第3层雪纺
    ctx.fillStyle = 'rgba(252, 248, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.quadraticCurveTo(-34 + sway * 0.7, 20, -38 + sway * 0.7, 45);
    ctx.lineTo(38 + sway * 0.7, 45);
    ctx.quadraticCurveTo(34 + sway * 0.7, 20, 18, 4);
    ctx.closePath();
    ctx.fill();

    // 第4层外纱（最外层半透明，拖尾）
    ctx.fillStyle = 'rgba(255, 254, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(-20, 6);
    ctx.quadraticCurveTo(-42 + sway, 28, -48 + sway, 60);
    ctx.quadraticCurveTo(-40 + sway, 65, -20 + sway, 62);
    ctx.lineTo(20 + sway, 62);
    ctx.quadraticCurveTo(40 + sway, 65, 48 + sway, 60);
    ctx.quadraticCurveTo(42 + sway, 28, 20, 6);
    ctx.closePath();
    ctx.fill();

    // 外纱金边
    ctx.strokeStyle = 'rgba(230, 192, 64, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-20, 6);
    ctx.quadraticCurveTo(-42 + sway, 28, -48 + sway, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 6);
    ctx.quadraticCurveTo(42 + sway, 28, 48 + sway, 60);
    ctx.stroke();

    ctx.restore();
  }

  // ================================================================
  //  LEGS (腿部 + 白色过膝袜)
  // ================================================================
  drawLegs(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;

    ctx.save();
    ctx.translate(0, bob + 35);

    // 大腿（裙摆前短，可见部分）
    ctx.fillStyle = '#fff0e0';
    ctx.beginPath();
    ctx.roundRect(-7, 5, 14, 25, 4);
    ctx.fill();

    // 白色过膝袜
    const sockGrad = ctx.createLinearGradient(0, 30, 0, 80);
    sockGrad.addColorStop(0, '#faf8fc');
    sockGrad.addColorStop(0.5, '#f5f0f8');
    sockGrad.addColorStop(1, '#ede4f2');
    ctx.fillStyle = sockGrad;
    ctx.beginPath();
    ctx.roundRect(-8, 28, 16, 55, 5);
    ctx.fill();

    // 袜口金色纹
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 32);
    ctx.lineTo(8, 32);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 35);
    ctx.lineTo(8, 35);
    ctx.stroke();

    // 小腿
    ctx.fillStyle = '#fff0e0';
    ctx.beginPath();
    ctx.roundRect(-6, 80, 12, 40, 4);
    ctx.fill();

    // 高跟鞋
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(-7, 118);
    ctx.quadraticCurveTo(-8, 125, -4, 130);
    ctx.lineTo(4, 130);
    ctx.quadraticCurveTo(8, 125, 7, 118);
    ctx.lineTo(-7, 118);
    ctx.fill();
    // 鞋跟
    ctx.fillStyle = '#0d0d1a';
    ctx.beginPath();
    ctx.roundRect(-2, 128, 4, 8, 1);
    ctx.fill();
    // 鞋面金色装饰
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, 120);
    ctx.quadraticCurveTo(0, 118, 6, 120);
    ctx.stroke();

    ctx.restore();
  }

  // ================================================================
  //  HEAD (头部基础)
  // ================================================================
  drawHead(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    const tilt = this.headTilt * 0.05;

    ctx.save();
    ctx.translate(0, bob - 62);
    ctx.rotate(tilt);

    // 颈部
    ctx.fillStyle = '#fff0e0';
    ctx.beginPath();
    ctx.roundRect(-6, 8, 12, 16, 3);
    ctx.fill();

    // 脸部轮廓（瓜子脸，尖下巴）
    const faceGrad = ctx.createRadialGradient(0, -12, 4, 0, -5, 35);
    faceGrad.addColorStop(0, '#fffdf8');
    faceGrad.addColorStop(0.5, '#fff5ee');
    faceGrad.addColorStop(0.85, '#fce8d8');
    faceGrad.addColorStop(1, '#f0d8c0');
    ctx.fillStyle = faceGrad;

    ctx.beginPath();
    // 顶部
    ctx.moveTo(0, -38);
    // 右颞
    ctx.bezierCurveTo(16, -38, 27, -22, 26, -5);
    // 右脸颊
    ctx.bezierCurveTo(25, 6, 20, 14, 12, 18);
    // 下巴尖
    ctx.bezierCurveTo(8, 22, 2, 24, 0, 25);
    // 左脸颊
    ctx.bezierCurveTo(-2, 24, -8, 22, -12, 18);
    // 左颞
    ctx.bezierCurveTo(-20, 14, -25, 6, -26, -5);
    ctx.bezierCurveTo(-27, -22, -16, -38, 0, -38);
    ctx.fill();

    // 下巴轮廓加深
    ctx.strokeStyle = 'rgba(180, 150, 130, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // ================================================================
  //  FACE (五官)
  // ================================================================
  drawFace(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    const tilt = this.headTilt * 0.05;

    ctx.save();
    ctx.translate(0, bob - 62);
    ctx.rotate(tilt);

    // === 腮红 ===
    if (this.blushAlpha > 0) {
      ctx.fillStyle = `rgba(255, 140, 140, ${this.blushAlpha * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(-13, 2, 9, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(13, 2, 9, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // === 眉毛 ===
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1.2;
    // 左眉
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.quadraticCurveTo(-10, -14, -4, -11);
    ctx.stroke();
    // 右眉
    ctx.beginPath();
    ctx.moveTo(4, -11);
    ctx.quadraticCurveTo(10, -14, 16, -10);
    ctx.stroke();

    // === 眼睛（金色竖瞳——标志性特征） ===
    this.drawAnimeEye(ctx, -10, -5, -1);
    this.drawAnimeEye(ctx, 10, -5, 1);

    // === 鼻子 ===
    ctx.fillStyle = 'rgba(210, 170, 150, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(2, 4, 0, 5);
    ctx.fill();

    // === 嘴巴 ===
    ctx.strokeStyle = '#c88090';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (this.isSurprised) {
      ctx.arc(0, 13, 4.5, 0.1, Math.PI * 2 - 0.1);
    } else {
      ctx.arc(0, 12, 5, 0.15, Math.PI - 0.15);
    }
    ctx.stroke();

    // 下唇微光泽
    if (!this.isSurprised) {
      ctx.fillStyle = 'rgba(255, 200, 200, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 13, 3, 1.5, 0, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 绘制动漫风格金色竖瞳眼睛
   */
  drawAnimeEye(ctx, x, y, side) {
    const blink = this.blinkProgress;
    const scaleY = blink < 0.7 ? 1 : 1 - (blink - 0.7) / 0.3;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, scaleY);

    // 眼白
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 上睫毛线（粗线）
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, Math.PI, 0);
    ctx.stroke();

    // 睫毛尖
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-7, -5);
    ctx.lineTo(-8, -8);
    ctx.moveTo(-3, -6.5);
    ctx.lineTo(-3, -9.5);
    ctx.moveTo(1, -6.5);
    ctx.lineTo(1.5, -9.5);
    ctx.moveTo(5, -5.5);
    ctx.lineTo(6, -8);
    ctx.stroke();

    // 虹膜（金色渐变）
    const irisGrad = ctx.createRadialGradient(
      -side * 1, -1, 1.5,
      -side * 1, -1, 5.5
    );
    irisGrad.addColorStop(0, '#ffe860');
    irisGrad.addColorStop(0.3, '#ffd700');
    irisGrad.addColorStop(0.6, '#daa520');
    irisGrad.addColorStop(1, '#b8860b');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(-side * 1 + this.eyeFollowX * 0.3, this.eyeFollowY * 0.2, 5, 0, Math.PI * 2);
    ctx.fill();

    // 竖瞳（纵向椭圆，标志性succubus瞳孔）
    ctx.fillStyle = '#0a0500';
    ctx.beginPath();
    ctx.ellipse(
      -side * 1 + this.eyeFollowX * 0.3,
      this.eyeFollowY * 0.2,
      1.5, 3.5,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // 瞳孔高光（两点——增加灵动感）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(-side * 2 + this.eyeFollowX * 0.3, -3 + this.eyeFollowY * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-side * 1 + this.eyeFollowX * 0.3, 2 + this.eyeFollowY * 0.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 下睫毛线（细线）
    ctx.strokeStyle = 'rgba(40, 30, 40, 0.6)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // ================================================================
  //  FRONT HAIR (前发——姬发式)
  // ================================================================
  drawFrontHair(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;
    const sway = Math.sin(this.hairSway) * 0.5;

    ctx.save();
    ctx.translate(0, bob - 62);

    // === 刘海（中心分开的姬发式） ===
    ctx.fillStyle = '#0d0d1a';

    // 左半刘海
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.quadraticCurveTo(-8, -39, -16, -37);
    ctx.quadraticCurveTo(-24, -33, -25, -24);
    ctx.quadraticCurveTo(-23, -13, -18, -8);
    ctx.quadraticCurveTo(-10, -6, -3, -7);
    ctx.quadraticCurveTo(-1, -15, 0, -25);
    ctx.fill();

    // 右半刘海
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.quadraticCurveTo(8, -39, 16, -37);
    ctx.quadraticCurveTo(24, -33, 25, -24);
    ctx.quadraticCurveTo(23, -13, 18, -8);
    ctx.quadraticCurveTo(10, -6, 3, -7);
    ctx.quadraticCurveTo(1, -15, 0, -25);
    ctx.fill();

    // 中心分缝
    ctx.strokeStyle = 'rgba(30, 30, 50, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -37);
    ctx.lineTo(0, -10);
    ctx.stroke();

    // 刘海光泽
    ctx.fillStyle = 'rgba(40, 40, 65, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-10, -36);
    ctx.quadraticCurveTo(0, -40, 10, -36);
    ctx.quadraticCurveTo(5, -30, -5, -30);
    ctx.fill();

    // === 标志性侧发束（姬发式的关键！） ===
    // 左侧发束
    ctx.fillStyle = '#0d0d1a';
    ctx.beginPath();
    ctx.moveTo(-24, -30);
    ctx.quadraticCurveTo(-26 + sway, -5, -24 + sway, 18);
    ctx.quadraticCurveTo(-22 + sway, 25, -19 + sway, 18);
    ctx.quadraticCurveTo(-18 + sway, -5, -18, -28);
    ctx.closePath();
    ctx.fill();

    // 右侧发束
    ctx.beginPath();
    ctx.moveTo(24, -30);
    ctx.quadraticCurveTo(26 + sway, -5, 24 + sway, 18);
    ctx.quadraticCurveTo(22 + sway, 25, 19 + sway, 18);
    ctx.quadraticCurveTo(18 + sway, -5, 18, -28);
    ctx.closePath();
    ctx.fill();

    // 侧发束光泽
    ctx.fillStyle = 'rgba(45, 45, 70, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-22, -25);
    ctx.quadraticCurveTo(-23 + sway * 0.5, 0, -21 + sway * 0.5, 12);
    ctx.quadraticCurveTo(-20 + sway * 0.5, 5, -20, -20);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(22, -25);
    ctx.quadraticCurveTo(23 + sway * 0.5, 0, 21 + sway * 0.5, 12);
    ctx.quadraticCurveTo(20 + sway * 0.5, 5, 20, -20);
    ctx.fill();

    // === 头顶碎发 ===
    ctx.fillStyle = '#0d0d1a';
    ctx.beginPath();
    ctx.moveTo(-16, -38);
    ctx.quadraticCurveTo(0, -45, 16, -38);
    ctx.quadraticCurveTo(8, -42, 0, -41);
    ctx.quadraticCurveTo(-8, -42, -16, -38);
    ctx.fill();

    ctx.restore();
  }

  // ================================================================
  //  HORNS (黑曜石犄角)
  // ================================================================
  drawHorns(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;

    ctx.save();
    ctx.translate(0, bob - 62);

    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * 13, -36);
      ctx.rotate(side * 0.35);

      const hornGrad = ctx.createLinearGradient(0, 0, 0, -25);
      hornGrad.addColorStop(0, '#2a2a2a');
      hornGrad.addColorStop(0.3, '#1a1a1a');
      hornGrad.addColorStop(0.7, '#333333');
      hornGrad.addColorStop(1, '#444444');
      ctx.fillStyle = hornGrad;

      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(-6, -12, -3, -22);
      ctx.quadraticCurveTo(-1, -28, 3, -26);
      ctx.quadraticCurveTo(5, -22, 6, -12);
      ctx.quadraticCurveTo(6, -4, 5, 0);
      ctx.closePath();
      ctx.fill();

      // 犄角纹理
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-5, -i * 6);
        ctx.quadraticCurveTo(0, -i * 6 - 2, 4, -i * 6);
        ctx.stroke();
      }

      // 高光
      ctx.fillStyle = 'rgba(100, 100, 110, 0.25)';
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.quadraticCurveTo(-3, -10, -1, -18);
      ctx.quadraticCurveTo(0, -16, 0, -2);
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  // ================================================================
  //  ACCESSORIES (配饰)
  // ================================================================
  drawAccessories(ctx) {
    const bob = Math.sin(this.bodyBob) * 2;

    ctx.save();
    ctx.translate(0, bob - 62);

    // === 金色蛛网项圈 ===
    // 主环
    ctx.strokeStyle = '#e6c040';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-9, 4);
    ctx.quadraticCurveTo(0, 1, 9, 4);
    ctx.stroke();

    // 蛛网纹装饰
    ctx.fillStyle = '#e6c040';
    ctx.beginPath();
    ctx.arc(0, 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // 中心紫宝石
    ctx.fillStyle = '#7700aa';
    ctx.beginPath();
    ctx.arc(0, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200, 100, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-0.5, 2, 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ================================================================
  //  SPEECH BUBBLE
  // ================================================================
  drawSpeechBubble(ctx, width, height) {
    const alpha = Math.min(1, this.speechTimer / 0.3);
    const cx = width / 2;
    const bubbleY = 8;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.font = '13px "Microsoft YaHei", "PingFang SC", sans-serif';
    const metrics = ctx.measureText(this.speechText);
    const bw = Math.max(metrics.width + 28, 80);
    const bh = 30;

    // 气泡背景
    ctx.fillStyle = 'rgba(22, 22, 42, 0.9)';
    ctx.strokeStyle = 'rgba(200, 160, 100, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, bubbleY, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // 小尾巴
    ctx.fillStyle = 'rgba(22, 22, 42, 0.9)';
    ctx.beginPath();
    ctx.moveTo(cx - 6, bubbleY + bh);
    ctx.lineTo(cx, bubbleY + bh + 7);
    ctx.lineTo(cx + 6, bubbleY + bh);
    ctx.fill();

    // 文字
    ctx.fillStyle = '#f0e0d0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.speechText, cx, bubbleY + bh / 2);

    ctx.restore();
  }

  // ================================================================
  //  HIT TEST
  // ================================================================
  hitTest(mx, my, canvasWidth, canvasHeight) {
    const cx = canvasWidth / 2 + this.x;
    const cy = canvasHeight / 2 + this.y + 20;
    const dx = mx - cx;
    const dy = my - cy;

    // 头部区域
    const headY = cy - 62;
    const headDist = Math.sqrt(dx * dx + (my - headY) * (my - headY));
    if (headDist < 28 && my < cy - 30) return 'head';

    // 身体区域
    if (Math.abs(dx) < 30 && my > cy - 40 && my < cy + 30) return 'body';

    // 裙摆区域
    if (Math.abs(dx) < 50 && my > cy + 20 && my < cy + 100) return 'skirt';

    // 翅膀区域
    if (Math.abs(dx) > 30 && Math.abs(dx) < 75 && my < cy + 30 && my > cy - 50) return 'wing';

    return null;
  }
}
