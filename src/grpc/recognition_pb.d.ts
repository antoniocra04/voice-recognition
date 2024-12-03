import * as jspb from 'google-protobuf';

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {};
}

export class Model extends jspb.Message {
  getName(): string;
  setName(value: string): Model;

  getDescription(): string;
  setDescription(value: string): Model;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Model.AsObject;
  static toObject(includeInstance: boolean, msg: Model): Model.AsObject;
  static serializeBinaryToWriter(message: Model, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Model;
  static deserializeBinaryFromReader(message: Model, reader: jspb.BinaryReader): Model;
}

export namespace Model {
  export type AsObject = {
    name: string;
    description: string;
  };
}

export class ModelsResponse extends jspb.Message {
  getModelsList(): Array<Model>;
  setModelsList(value: Array<Model>): ModelsResponse;
  clearModelsList(): ModelsResponse;
  addModels(value?: Model, index?: number): Model;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ModelsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ModelsResponse): ModelsResponse.AsObject;
  static serializeBinaryToWriter(message: ModelsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ModelsResponse;
  static deserializeBinaryFromReader(
    message: ModelsResponse,
    reader: jspb.BinaryReader
  ): ModelsResponse;
}

export namespace ModelsResponse {
  export type AsObject = {
    modelsList: Array<Model.AsObject>;
  };
}

export class RecognitionConfig extends jspb.Message {
  getModel(): string;
  setModel(value: string): RecognitionConfig;

  getFileName(): string;
  setFileName(value: string): RecognitionConfig;

  getEnableAutomaticPunctuation(): boolean;
  setEnableAutomaticPunctuation(value: boolean): RecognitionConfig;

  getSilAfterWordTimeoutMs(): number;
  setSilAfterWordTimeoutMs(value: number): RecognitionConfig;

  getSampleRate(): number;
  setSampleRate(value: number): RecognitionConfig;

  getEnableAnswerphoneDetection(): boolean;
  setEnableAnswerphoneDetection(value: boolean): RecognitionConfig;

  getEnableSentimentsDetection(): boolean;
  setEnableSentimentsDetection(value: boolean): RecognitionConfig;

  getEnableAgeIdentification(): boolean;
  setEnableAgeIdentification(value: boolean): RecognitionConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecognitionConfig.AsObject;
  static toObject(includeInstance: boolean, msg: RecognitionConfig): RecognitionConfig.AsObject;
  static serializeBinaryToWriter(message: RecognitionConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecognitionConfig;
  static deserializeBinaryFromReader(
    message: RecognitionConfig,
    reader: jspb.BinaryReader
  ): RecognitionConfig;
}

export namespace RecognitionConfig {
  export type AsObject = {
    model: string;
    fileName: string;
    enableAutomaticPunctuation: boolean;
    silAfterWordTimeoutMs: number;
    sampleRate: number;
    enableAnswerphoneDetection: boolean;
    enableSentimentsDetection: boolean;
    enableAgeIdentification: boolean;
  };
}

export class StreamingRecognitionRequest extends jspb.Message {
  getConfig(): RecognitionConfig | undefined;
  setConfig(value?: RecognitionConfig): StreamingRecognitionRequest;
  hasConfig(): boolean;
  clearConfig(): StreamingRecognitionRequest;

  getAudioContent(): Uint8Array | string;
  getAudioContent_asU8(): Uint8Array;
  getAudioContent_asB64(): string;
  setAudioContent(value: Uint8Array | string): StreamingRecognitionRequest;

  getOnlyNew(): boolean;
  setOnlyNew(value: boolean): StreamingRecognitionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamingRecognitionRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StreamingRecognitionRequest
  ): StreamingRecognitionRequest.AsObject;
  static serializeBinaryToWriter(
    message: StreamingRecognitionRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): StreamingRecognitionRequest;
  static deserializeBinaryFromReader(
    message: StreamingRecognitionRequest,
    reader: jspb.BinaryReader
  ): StreamingRecognitionRequest;
}

export namespace StreamingRecognitionRequest {
  export type AsObject = {
    config?: RecognitionConfig.AsObject;
    audioContent: Uint8Array | string;
    onlyNew: boolean;
  };
}

export class StreamingRecognitionResponse extends jspb.Message {
  getChunksList(): Array<SpeechRecognitionChunk>;
  setChunksList(value: Array<SpeechRecognitionChunk>): StreamingRecognitionResponse;
  clearChunksList(): StreamingRecognitionResponse;
  addChunks(value?: SpeechRecognitionChunk, index?: number): SpeechRecognitionChunk;

  getSessionId(): string;
  setSessionId(value: string): StreamingRecognitionResponse;

  getText(): string;
  setText(value: string): StreamingRecognitionResponse;

  getFinal(): boolean;
  setFinal(value: boolean): StreamingRecognitionResponse;

  getQualityScore(): number;
  setQualityScore(value: number): StreamingRecognitionResponse;

  getAnswerphoneDetected(): boolean;
  setAnswerphoneDetected(value: boolean): StreamingRecognitionResponse;

  getSentimentsInfo(): SentimentsInfo | undefined;
  setSentimentsInfo(value?: SentimentsInfo): StreamingRecognitionResponse;
  hasSentimentsInfo(): boolean;
  clearSentimentsInfo(): StreamingRecognitionResponse;

  getWordsPerSecond(): number;
  setWordsPerSecond(value: number): StreamingRecognitionResponse;

  getAgeGroup(): string;
  setAgeGroup(value: string): StreamingRecognitionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamingRecognitionResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StreamingRecognitionResponse
  ): StreamingRecognitionResponse.AsObject;
  static serializeBinaryToWriter(
    message: StreamingRecognitionResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): StreamingRecognitionResponse;
  static deserializeBinaryFromReader(
    message: StreamingRecognitionResponse,
    reader: jspb.BinaryReader
  ): StreamingRecognitionResponse;
}

export namespace StreamingRecognitionResponse {
  export type AsObject = {
    chunksList: Array<SpeechRecognitionChunk.AsObject>;
    sessionId: string;
    text: string;
    pb_final: boolean;
    qualityScore: number;
    answerphoneDetected: boolean;
    sentimentsInfo?: SentimentsInfo.AsObject;
    wordsPerSecond: number;
    ageGroup: string;
  };
}

export class SpeechRecognitionChunk extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SpeechRecognitionChunk.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SpeechRecognitionChunk
  ): SpeechRecognitionChunk.AsObject;
  static serializeBinaryToWriter(message: SpeechRecognitionChunk, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SpeechRecognitionChunk;
  static deserializeBinaryFromReader(
    message: SpeechRecognitionChunk,
    reader: jspb.BinaryReader
  ): SpeechRecognitionChunk;
}

export namespace SpeechRecognitionChunk {
  export type AsObject = {};
}

export class SentimentsInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SentimentsInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SentimentsInfo): SentimentsInfo.AsObject;
  static serializeBinaryToWriter(message: SentimentsInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SentimentsInfo;
  static deserializeBinaryFromReader(
    message: SentimentsInfo,
    reader: jspb.BinaryReader
  ): SentimentsInfo;
}

export namespace SentimentsInfo {
  export type AsObject = {};
}
