import { Live2dModel } from '../utils/live2dModel';

class AnimationSequence {
  public start: number;
  public end: number;
  public values: Array<number>;

  public constructor(start: number, end: number, values: Array<number>) {
    this.start = start;
    this.end = end;
    this.values = values;
  }
}

class Prediction {
  public blendshapes: any;
  public lookX: number;
  public lookY: number;

  public constructor(blendshapes: any, lookX: number, lookY: number) {
    this.blendshapes = Object.entries(blendshapes);
    this.lookX = lookX;
    this.lookY = lookY;
  }
}

const readAnimationSequence = (obj: any) => {
  let animationSequence: Array<AnimationSequence> = [];
  for (const d of obj) {
    animationSequence.push(new AnimationSequence(d.start, d.end, d.value));
  }
  return animationSequence;
}

const findAnimationValue = (
  aSeqs: Array<AnimationSequence>,
  time: number,
  renderInterval: number
) => {
  let value = 0;
  if (aSeqs) {
    for (const aSeq of aSeqs) {
      if (time >= aSeq.start && time < aSeq.end) {
        const elapsedIdx = Math.min(
          Math.round((time - aSeq.start) / renderInterval),
          aSeq.values.length - 1
        );
        value = aSeq.values[elapsedIdx];
        break;
      }
    }
  }
  return value;
};

export class AnimationGenerator {
  private _live2dModel: Live2dModel | null;
  private _renderInterval: number | null;
  private _animationDuration: number | null;
  private _startTime: number | null;
  private _lookXSeq: Array<AnimationSequence> | null;
  private _lookYSeq: Array<AnimationSequence> | null;
  private _leftLookInSeq: Array<AnimationSequence> | null;
  private _leftLookOutSeq: Array<AnimationSequence> | null;
  private _leftLookUpSeq: Array<AnimationSequence> | null;
  private _leftLookDownSeq: Array<AnimationSequence> | null;
  private _rightLookInSeq: Array<AnimationSequence> | null;
  private _rightLookOutSeq: Array<AnimationSequence> | null;
  private _rightLookUpSeq: Array<AnimationSequence> | null;
  private _rightLookDownSeq: Array<AnimationSequence> | null;
  private _leftBlinkSeq: Array<AnimationSequence> | null;
  private _rightBlinkSeq: Array<AnimationSequence> | null;
  private _leftBrowInnerUp: Array<AnimationSequence> | null;
  private _rightBrowInnerUp: Array<AnimationSequence> | null;
  private _mouthOpenSeq: Array<AnimationSequence> | null;
  private _smileSeq: Array<AnimationSequence> | null;
  private _peaceSeq: Array<AnimationSequence> | null;
  private _prevPeaceValue: number = 0;
  private _fieryEyesSeq: Array<AnimationSequence> | null;
  private _prevFieryEyesValue: number = 0;
  private _activatedExpressions: string[] = [];

  public constructor() {
    this.resetSequence();
  }

  public loadData = (json: any) => {
    if (!json) {
      console.error('Invalid animation sequence');
      return;
    }
    // parse render interval
    if (json.renderInterval) {
      this._renderInterval = json.renderInterval;
    }
    // parse animation duration
    if (json.animationDuration) {
      this._animationDuration = json.animationDuration;
    }
    // parser data
    if (json.parameters) {
      const data = json.parameters;
      if (data.lookX) {
        this._lookXSeq = readAnimationSequence(data.lookX);
      }
      if (data.lookY) {
        this._lookYSeq = readAnimationSequence(data.lookY);
      }
      if (data.leftLookIn) {
        this._leftLookInSeq = readAnimationSequence(data.leftLookIn);
      }
      if (data.leftLookOut) {
        this._leftLookOutSeq = readAnimationSequence(data.leftLookOut);
      }
      if (data.leftLookUp) {
        this._leftLookUpSeq = readAnimationSequence(data.leftLookUp);
      }
      if (data.leftLookDown) {
        this._leftLookDownSeq = readAnimationSequence(data.leftLookDown);
      }
      if (data.rightLookIn) {
        this._rightLookInSeq = readAnimationSequence(data.rightLookIn);
      }
      if (data.rightLookOut) {
        this._rightLookOutSeq = readAnimationSequence(data.rightLookOut);
      }
      if (data.rightLookUp) {
        this._rightLookUpSeq = readAnimationSequence(data.rightLookUp);
      }
      if (data.rightLookDown) {
        this._rightLookDownSeq = readAnimationSequence(data.rightLookDown);
      }
      if (data.leftBrowInnerUp) {
        this._leftBrowInnerUp = readAnimationSequence(data.leftBrowInnerUp);
      }
      if (data.rightBrowInnerUp) {
        this._rightBrowInnerUp = readAnimationSequence(data.rightBrowInnerUp);
      }
      if (data.leftBlink) {
        this._leftBlinkSeq = readAnimationSequence(data.leftBlink);
      }
      if (data.rightBlink) {
        this._rightBlinkSeq = readAnimationSequence(data.rightBlink);
      }
      if (data.mouthOpen) {
        this._mouthOpenSeq = readAnimationSequence(data.mouthOpen);
      }
      if (data.smile) {
        this._smileSeq = readAnimationSequence(data.smile);
      }
      if (data.expressions) {
        const expressions = data.expressions;
        if (expressions.peace) {
          this._peaceSeq = readAnimationSequence(expressions.peace);
        }
        if (expressions.fieryEyes) {
          this._fieryEyesSeq = readAnimationSequence(expressions.fieryEyes);
        }
      }
    }
    // reset start time
    this.resetSequence();
  }

  // register live2d model within the animation generator
  public registerLive2dModel = (live2dModel: Live2dModel) => {
    this._live2dModel = live2dModel;
  };

  // read the animation sequence from json file
  public loadJson = (path: string) => {
    fetch(path)
      .then(res => res.json())
      .then((json) => {
        this.loadData(json);
      }).catch(err => console.error(err));
  };

  // reset the time to the beginning of the sequence
  public resetSequence = () => {
    this._startTime = new Date().getTime();
  };

  // interact with expressions
  private updateExpression = (
    currVal: number, prevVal: number, expName: string
  ): boolean => {
    let updated = false;
    if (prevVal == 0 && currVal > 0) {
      // add expression
      const idx = this._activatedExpressions.indexOf(expName);
      if (idx == -1) {
        this._activatedExpressions.push(expName);
        updated = true;
      }
    } else if (prevVal > 0 && currVal == 0) {
      // remove expression
      const idx = this._activatedExpressions.indexOf(expName);
      if (idx > -1) {
        this._activatedExpressions.splice(idx, 1);
        updated = true;
      }
    }
    return updated;
  };

  // getter for the next prediction (that includes blendshape and rotation)
  // it tracks the time to load from the closest time stamp in the sequence
  public prediction = () => {
    const currTime = new Date().getTime();
    const elapsed = ((currTime - this._startTime) / 1000) % this._animationDuration;

    let blendshapes = {};

    blendshapes['eyeBlink_L'] = findAnimationValue(this._leftBlinkSeq, elapsed, this._renderInterval);
    blendshapes['eyeBlink_R'] = findAnimationValue(this._rightBlinkSeq, elapsed, this._renderInterval);
    blendshapes['jawOpen'] = findAnimationValue(this._mouthOpenSeq, elapsed, this._renderInterval);
    blendshapes['mouthSmile_L'] = findAnimationValue(this._smileSeq, elapsed, this._renderInterval);
    blendshapes['mouthSmile_R'] = findAnimationValue(this._smileSeq, elapsed, this._renderInterval);
    blendshapes['eyeSquint_L'] = findAnimationValue(this._smileSeq, elapsed, this._renderInterval);
    blendshapes['eyeSquint_R'] = findAnimationValue(this._smileSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookIn_L'] = findAnimationValue(this._leftLookInSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookOut_L'] = findAnimationValue(this._leftLookOutSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookUp_L'] = findAnimationValue(this._leftLookUpSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookDown_L'] = findAnimationValue(this._leftLookDownSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookIn_R'] = findAnimationValue(this._rightLookInSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookOut_R'] = findAnimationValue(this._rightLookOutSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookUp_R'] = findAnimationValue(this._rightLookUpSeq, elapsed, this._renderInterval);
    blendshapes['eyeLookDown_R'] = findAnimationValue(this._rightLookDownSeq, elapsed, this._renderInterval);
    blendshapes['browInnerUp_L'] = findAnimationValue(this._leftBrowInnerUp, elapsed, this._renderInterval);
    blendshapes['browInnerUp_R'] = findAnimationValue(this._rightBrowInnerUp, elapsed, this._renderInterval);

    const lookX = findAnimationValue(this._lookXSeq, elapsed, this._renderInterval);
    const lookY = findAnimationValue(this._lookYSeq, elapsed, this._renderInterval);

    const prediction = new Prediction(blendshapes, lookX, lookY);

    // apply expressions
    const peace = findAnimationValue(this._peaceSeq, elapsed, this._renderInterval);
    const fieryEyes = findAnimationValue(this._fieryEyesSeq, elapsed, this._renderInterval);
    if (this._live2dModel) {
      if (peace != 0 || this._prevPeaceValue != 0) {
        const updated = this.updateExpression(peace, this._prevPeaceValue, 'Peace');
        if (updated) {
          this._live2dModel.activateExpressions([...this._activatedExpressions]);
        }
      }
      if (fieryEyes != 0 || this._prevFieryEyesValue != 0) {
        const updated = this.updateExpression(fieryEyes, this._prevFieryEyesValue, 'Fiery Eyes');
        if (updated) {
          this._live2dModel.activateExpressions([...this._activatedExpressions]);
        }
      }
    }
    this._prevPeaceValue = peace
    this._prevFieryEyesValue = fieryEyes;

    return prediction;
  }
};
