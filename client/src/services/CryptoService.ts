import { argon2id } from '@noble/hashes/argon2'
import { EncryptedData, EncryptionMetadata, EncryptionOptions } from '../types/vault'

/**
 * Vault 데이터 암호화를 위한 서비스
 * AES-GCM + Argon2id 조합을 사용
 */
class CryptoService {
  private static readonly DEFAULT_ITERATIONS = 3 // noble/hashes에서는 더 적은 값 사용
  private static readonly DEFAULT_MEMORY_SIZE = 64 * 1024 // 64MB in KB
  private static readonly DEFAULT_PARALLELISM = 1
  private static readonly IV_LENGTH = 12 // GCM 모드에서 권장되는 IV 길이
  private static readonly SALT_LENGTH = 32 // 솔트 길이

  /**
   * 문자열을 ArrayBuffer로 변환
   */
  private static stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder()
    return encoder.encode(str)
  }

  /**
   * ArrayBuffer를 문자열로 변환
   */
  private static arrayBufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder()
    return decoder.decode(buffer)
  }

  /**
   * ArrayBuffer를 Base64 문자열로 변환
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Base64 문자열을 ArrayBuffer로 변환
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * 암호화용 솔트 생성
   */
  private static generateSalt(): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH))
  }

  /**
   * 암호화용 IV 생성
   */
  private static generateIV(): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))
  }

  /**
   * Argon2id를 사용하여 비밀번호에서 암호화 키 생성
   */
  private static async deriveKey(
    password: string,
    salt: ArrayBuffer,
    options: EncryptionOptions = {}
  ): Promise<ArrayBuffer> {
    const {
      iterations = this.DEFAULT_ITERATIONS,
      memorySize = this.DEFAULT_MEMORY_SIZE,
      parallelism = this.DEFAULT_PARALLELISM
    } = options

    try {
      // @noble/hashes argon2id 사용
      const passwordBytes = new Uint8Array(this.stringToArrayBuffer(password))
      const saltBytes = new Uint8Array(salt)
      
      const hash = argon2id(passwordBytes, saltBytes, {
        t: iterations, // time cost (iterations)
        m: memorySize, // memory cost in KB
        p: parallelism, // parallelism
        dkLen: 32 // output length (32 bytes for AES-256)
      })

      return hash.buffer
    } catch (error) {
      throw new Error(`키 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * AES-GCM을 사용하여 데이터 암호화
   */
  private static async encryptData(
    data: string,
    key: ArrayBuffer,
    iv: ArrayBuffer
  ): Promise<ArrayBuffer> {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )

      const encodedData = this.stringToArrayBuffer(data)
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encodedData
      )

      return encryptedData
    } catch (error) {
      throw new Error(`암호화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * AES-GCM을 사용하여 데이터 복호화
   */
  private static async decryptData(
    encryptedData: ArrayBuffer,
    key: ArrayBuffer,
    iv: ArrayBuffer
  ): Promise<string> {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encryptedData
      )

      return this.arrayBufferToString(decryptedData)
    } catch (error) {
      throw new Error(`복호화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * 데이터를 암호화하고 암호화 메타데이터와 함께 반환
   */
  public static async encrypt(
    data: string,
    secretKey: string,
    options: EncryptionOptions = {}
  ): Promise<EncryptedData> {
    try {
      // 솔트와 IV 생성
      const salt = this.generateSalt()
      const iv = this.generateIV()

      // 키 생성
      const key = await this.deriveKey(secretKey, salt, options)

      // 데이터 암호화
      const encryptedData = await this.encryptData(data, key, iv)

      // 메타데이터 생성
      const metadata: EncryptionMetadata = {
        algorithm: 'AES-GCM',
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        kdf: 'Argon2id',
        iterations: options.iterations || this.DEFAULT_ITERATIONS
      }

      return {
        data: this.arrayBufferToBase64(encryptedData),
        metadata
      }
    } catch (error) {
      throw new Error(`암호화 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * 암호화된 데이터를 복호화
   */
  public static async decrypt(
    encryptedData: EncryptedData,
    secretKey: string
  ): Promise<string> {
    try {
      const { data, metadata } = encryptedData

      // 메타데이터 검증
      if (metadata.algorithm !== 'AES-GCM') {
        throw new Error(`지원되지 않는 암호화 알고리즘: ${metadata.algorithm}`)
      }

      if (metadata.kdf !== 'Argon2id') {
        throw new Error(`지원되지 않는 키 유도 함수: ${metadata.kdf}`)
      }

      // Base64 디코딩
      const salt = this.base64ToArrayBuffer(metadata.salt)
      const iv = this.base64ToArrayBuffer(metadata.iv)
      const encrypted = this.base64ToArrayBuffer(data)

      // 키 생성 (저장된 파라미터 사용)
      const key = await this.deriveKey(secretKey, salt, {
        iterations: metadata.iterations
      })

      // 데이터 복호화
      const decryptedData = await this.decryptData(encrypted, key, iv)

      return decryptedData
    } catch (error) {
      throw new Error(`복호화 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  /**
   * 비밀번호 강도 검증
   */
  public static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('숫자를 포함해야 합니다')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default CryptoService 