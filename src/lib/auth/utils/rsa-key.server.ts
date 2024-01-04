import NodeRSA from "node-rsa";
import type { RSAPayload } from "../types";

// Move keys to somewhere else
const privateKeyData = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAu6n81gKppiOcaFtUnWoWkF6IviEmiDAgPEk4ODJ8RRg1MeFH
BOGIM5JA671uOsBPBSg9sh7+bFHRJhMcKN49urpy9gfBm7Q+TF46Vl3trqzc2gyP
fJext7skggK8ngZtG20hns1/PgA9ajPaVUw4zNalzN9fj/+//jjML4CAK/7Ra9Qw
V+yEbWfMAJz4SokIdY5INN5/OV4X7iHF3sxRlVq0lSq0jXf2yZdxtoYGDAMlhCVF
XrzbfZihIByE5SbcwpTUurIrl6/x+R8GaRKt8C80NfCplo6JtziRuyNA+6C2m2sO
LThWm/UhzaJhmmQSq/vDY3qSVQZg0PnMQUE7fwIDAQABAoIBADKL0qICDZfGN7aU
AvJzRKiWDdbILwy3ibczMYVRc89Yedt5hht2c60QU5Qrbak9awtEj3mOh5C9aMwM
kaUgVxgYaCaEaE17+tuu9Z+VpRNLVCEXCP7SDPgj2+14tz0JFhIxDsErMH6OqfwV
A1W+Nf5WQkowUBkFFb1vpu+UePFgNsmQxwUF4/zgcSzt0fchBTttNI63dO1HVZBK
PrUKi7NiUgTBUNg/LT1XmQ5tX3TFgxGWZhbh/KJghq3W+Kahk+DwAvIDDumm5SGL
ATTuE1JtqYcKAwW9OviHODACdimWFLyOEJ+fXZiid90erALvWgQ2Mr3HPCMc+FWu
ye+Jd6ECgYEA6lTnfAVh3T4yMmp1lAEGWD8wuLorA8G5wPqjN4+z/9fqx2fM1FNq
VjTBQ0JkDq0Z78Amz1qlSme25kcqWRnTYAKOaMEtCWGgeiTxbGCau/ux0pz0ARgh
jn4irNTSu08CDgAkf3r5++vpOJY163HXKgRjbRXpUUDPKCiO/OlxQ+UCgYEAzQRe
GzTxbtDvqulp1GhUKKKxj05wXpFHXaC3XNYgBh/aAdejDyJxU1yroAI5FcuM6vH5
l8JsU7SGAAUCjUlZt03ctsdet6K+6MTNq6tQb7beUTp+oTAqfbiPiBgbaT+dWUSg
G8DN6ZE99343trNg7FDO8KtImO5Cxf2lsjAkU5MCgYAj+UbUPktI2LyCCt/kCcg8
ke7b3RCvcfUfUBrwc6oxc6dCV4gVbHzdoRmuRqnvqtlZegk7OfI4GvX0Iia5KQLP
MXVFVaqhTxCAz90UQzxd8YTaDWhUJq04H9sY5082nCl3lsQDohBwgUX7fuvmKkLa
23OcEooQBEAJLTjOUNQnlQKBgECSDJWjEhtl4OZCh5tnlIIL48KP4OJX/VMmyDmM
Ex/6ri4AXZHptimcOU23BYWwy1xAA+1hRb8DT2T4LvqSzJfoBQjoOBO8RUaInYJg
/X+B5/lLZBCeW/OmykYB2bhHWeaAr7CuA+x5Wzv029VGH9OuC89PExlfiVZUcfhy
Iy7TAoGAZr9uhatmCQqCOfhMRwQA6Pc3DdWrJg2gKoV2JWsRU43VCLQaqsr5ammH
jMRKsT8bSxb+3f9WufQ+SvbTKYl25+ReZE1BCBqnHLGa7aRQN3UKeTjFQpExQpc4
HCl94NbRVhm108FOQvcVXQZbNENLb2s6X1WoKgkXYku4f+vCO98=
-----END RSA PRIVATE KEY-----`

const publicKeyData = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu6n81gKppiOcaFtUnWoW
kF6IviEmiDAgPEk4ODJ8RRg1MeFHBOGIM5JA671uOsBPBSg9sh7+bFHRJhMcKN49
urpy9gfBm7Q+TF46Vl3trqzc2gyPfJext7skggK8ngZtG20hns1/PgA9ajPaVUw4
zNalzN9fj/+//jjML4CAK/7Ra9QwV+yEbWfMAJz4SokIdY5INN5/OV4X7iHF3sxR
lVq0lSq0jXf2yZdxtoYGDAMlhCVFXrzbfZihIByE5SbcwpTUurIrl6/x+R8GaRKt
8C80NfCplo6JtziRuyNA+6C2m2sOLThWm/UhzaJhmmQSq/vDY3qSVQZg0PnMQUE7
fwIDAQAB
-----END PUBLIC KEY-----`




// class RSAKey {
//     private instance: RSAKey | undefined;

//     constructor() {
//         if (!this.instance) {

//             this.key = new NodeRSA();
//             this.key.importKey(privateKeyData, "private");
//             this.key.importKey(publicKeyData, "public");
//             this.instance = this;
//         }
//     }

//     encrypt(data: string) {
//         return this.key.encrypt(data);
//     }

//     decrypt(data: string) {
//         return this.key.decrypt(data).toString();
//     }
// }

class SingletonRSAKey {
    private static instance: SingletonRSAKey;
    private key: NodeRSA;

    private constructor() {
        this.key = new NodeRSA();
        this.key.importKey(privateKeyData, "private");
        this.key.importKey(publicKeyData, "public");
    }

    public static getInstance(): SingletonRSAKey {
        if (!SingletonRSAKey.instance) {
            SingletonRSAKey.instance = new SingletonRSAKey();
        }

        return SingletonRSAKey.instance;
    }

    public encrypt(data: string) {
        return this.key.encrypt(data, "base64").toString();
    }
    public decrypt(data: string) {
        return this.key.decrypt(data,).toString();
    }


}


export const RSAKey = SingletonRSAKey.getInstance();