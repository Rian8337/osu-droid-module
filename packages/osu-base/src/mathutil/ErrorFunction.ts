import { Polynomial } from "./Polynomial";

/**
 * A Math utility class containing all methods related to the error function.
 *
 * This class shares the same implementation as {@link https://numerics.mathdotnet.com/ Math.NET Numerics}.
 */
export abstract class ErrorFunction {
    //#region Coefficients for erfImp

    /**
     * Polynomial coefficients for a numerator of erfImp
     * calculation for erf(x) in the interval [1e-10, 0.5].
     */
    private static readonly erfImpAn: number[] = [
        0.003379167095512574, -0.0007369565304816795, -0.37473233739291961,
        0.0817442448733587, -0.04210893199365486, 0.007016570951209576,
        -0.004950912559824351, 0.0008716465990379225,
    ];

    /**
     * Polynomial coefficients for a denominator of erfImp
     * calculation for erf(x) in the interval [1e-10, 0.5].
     */
    private static readonly erfImpAd: number[] = [
        1, -0.2180882180879246, 0.4125429727254421, -0.08418911478731068,
        0.0655338856400242, -0.01200196044549418, 0.00408165558926174,
        -0.0006159007215577697,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculationfor erfc(x) in the interval [0.5, 0.75].
     */
    private static readonly erfImpBn: number[] = [
        -0.03617903907182625, 0.29225188344488268, 0.2814470417976045,
        0.12561020886276694, 0.02741350282689305, 0.002508396721680658,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for Erfc(x) in the interval [0.5, 0.75].
     */
    private static readonly erfImpBd: number[] = [
        1, 1.8545005897903486, 1.43575803037831418, 0.58282765875303655,
        0.1248104769329497, 0.011372417654635328,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [0.75, 1.25].
     */
    private static readonly erfImpCn: number[] = [
        -0.03978768926111369, 0.15316521246787829, 0.19126029560093624,
        0.10276327061989304, 0.029637090615738836, 0.004609348678027549,
        0.0003076078203486802,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [0.75, 1.25].
     */
    private static readonly erfImpCd: number[] = [
        1, 1.955200729876277, 1.6476231719938486, 0.7682386070221263,
        0.20979318593650978, 0.03195693168999134, 0.0021336316089578537,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [1.25, 2.25].
     */
    private static readonly erfImpDn: number[] = [
        -0.030083856055794972, 0.05385788298444545, 0.07262115416519142,
        0.03676284698880493, 0.009646290155725275, 0.0013345348007529107,
        0.778087599782504e-4,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [1.25, 2.25].
     */
    private static readonly erfImpDd: number[] = [
        1, 1.7596709814716753, 1.3288357143796112, 0.5525285965087576,
        0.1337930569413329, 0.017950964517628076, 0.001047124400199374,
        -0.10664038182035734e-7,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [2.25, 3.5].
     */
    private static readonly erfImpEn: number[] = [
        -0.011790757013722784, 0.01426213209053881, 0.02022344359029608,
        0.00930668299990432, 0.0021335780242206599, 0.000250229873864601,
        0.1205349122195882e-4,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [2.25, 3.5].
     */
    private static readonly erfImpEd: number[] = [
        1, 1.5037622520362048, 0.9653977862044629, 0.3392652304767967,
        0.068974064954157, 0.0077106026249176831, 0.0003714211015310693,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [3.5, 5.25].
     */
    private static readonly erfImpFn: number[] = [
        -0.005469547955387293, 0.004041902787317071, 0.0054963369553161171,
        0.002126164726039454, 0.0003949840144950839, 0.36556547706444238e-4,
        0.13548589710993232e-5,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [3.5, 5.25].
     */
    private static readonly erfImpFd: number[] = [
        1, 1.210196977736308, 0.6209146682211439, 0.1730384306611428,
        0.0276550813773432, 0.002406259744243097, 0.8918118172513366e-4,
        -0.4655288362833827e-11,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [5.25, 8].
     */
    private static readonly erfImpGn: number[] = [
        -0.002707225359057783, 0.00131875634250294, 0.0011992593326100233,
        0.00027849619811344664, 0.2678229882183318e-4, 0.9230436723150282e-6,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [5.25, 8].
     */
    private static readonly erfImpGd: number[] = [
        1, 0.8146328085431416, 0.26890166585629954, 0.04498772161030411,
        0.003817596633202485, 0.0001315718978885969, 0.4048153596757641e-11,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [8, 11.5].
     */
    private static readonly erfImpHn: number[] = [
        -0.001099467206917422, 0.00040642544275042267, 0.0002744994894169007,
        0.4652937706466594e-4, 0.320955425395767463e-5, 0.778286018145021e-7,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [8, 11.5].
     */
    private static readonly erfImpHd: number[] = [
        1, 0.588173710611846, 0.13936333128940975, 0.016632934041708368,
        0.0010002392131023491, 0.2425483752158723e-4,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [11.5, 17].
     */
    private static readonly erfImpIn: number[] = [
        -0.0005690799360109496, 0.0001694985403737623, 0.5184723545811009e-4,
        0.38281931223192885e-5, 0.8249899312818944e-7,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [11.5, 17].
     */
    private static readonly erfImpId: number[] = [
        1, 0.3396372500511393, 0.04347264787031066, 0.002485493352246371,
        0.5356333053371529e-4, -0.11749094440545958e-12,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [17, 24].
     */
    private static readonly erfImpJn: number[] = [
        -0.000241313599483991337, 0.5742249752025015e-4, 0.11599896292738377e-4,
        0.581762134402594e-6, 0.8539715550856736e-8,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [17, 24].
     */
    private static readonly erfImpJd: number[] = [
        1, 0.23304413829968784, 0.02041869405464403, 0.0007971856475643983,
        0.11701928167017232e-4,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [24, 38].
     */
    private static readonly erfImpKn: number[] = [
        -0.00014667469927776036, 0.1626665521122805e-4, 0.26911624850916523e-5,
        0.979584479468092e-7, 0.10199464762572346e-8,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [24, 38].
     */
    private static readonly erfImpKd: number[] = [
        1, 0.16590781294484722, 0.010336171619150588, 0.0002865930263738684,
        0.29840157084090034e-5,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [38, 60].
     */
    private static readonly erfImpLn: number[] = [
        -0.5839057976297718e-4, 0.4125103251054962e-5, 0.43179092242025094e-6,
        0.9933651555900132e-8, 0.653480510020105e-10,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [38, 60].
     */
    private static readonly erfImpLd: number[] = [
        1, 0.1050770860720399, 0.004142784286754756, 0.726338754644524e-4,
        0.477818471047398785e-6,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [60, 85].
     */
    private static readonly erfImpMn: number[] = [
        -0.196457797609229579e-4, 0.1572438876668007e-5, 0.5439025111927009e-7,
        0.3174724923691177e-9,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [60, 85].
     */
    private static readonly erfImpMd: number[] = [
        1, 0.05280398924095763, 0.0009268760691517533, 0.5410117232266303e-5,
        0.5350938458036424e-15,
    ];

    /**
     * Polynomial coefficients for a numerator in erfImp
     * calculation for erfc(x) in the interval [85, 110].
     */
    private static readonly erfImpNn: number[] = [
        -0.789224703978723e-5, 0.622088451660987e-6, 0.1457284456768824e-7,
        0.603715505542715e-10,
    ];

    /**
     * Polynomial coefficients for a denominator in erfImp
     * calculation for erfc(x) in the interval [85, 110].
     */
    private static readonly erfImpNd: number[] = [
        1, 0.037532884635629371, 0.0004679195359746253, 0.19384703927584565e-5,
    ];

    //#endregion
    //#region Coefficients for erfInvImp

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0, 0.5].
     */
    private static readonly ervInvImpAn: number[] = [
        -0.0005087819496582806, -0.0083687481974173677, 0.033480662540974461,
        -0.012692614766297402, -0.03656379714117627, 0.02198786811111689,
        0.008226878746769157, -0.005387729650712429,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0, 0.5].
     */
    private static readonly ervInvImpAd: number[] = [
        1, -0.9700050433032906, -1.565745582341758, 1.5622155839842302,
        0.662328840472003, -0.7122890234154285, -0.05273963823400997,
        0.079528368734157168, -0.0023339375937419, 0.0008862163904564247,
    ];

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.5, 0.75].
     */
    private static readonly ervInvImpBn: number[] = [
        -0.2024335083559388, 0.10526468069939171, 8.3705032834312,
        17.6447298408374, -18.85106480587143, -44.6382324441787,
        17.445385985570866, 21.12946554483405, -3.671922547077293,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.5, 0.75].
     */
    private static readonly ervInvImpBd: number[] = [
        1, 6.24264124854247537, 3.9713437953343869, -28.66081804998,
        -20.14326346804852, 48.56092131087399, 10.82686673554602,
        -22.64369334131397, 1.7211476576120028,
    ];

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x less than 3.
     */
    private static readonly ervInvImpCn: number[] = [
        -0.1311027816799519, -0.1637940471933171, 0.11703015634199525,
        0.387079738972604337, 0.3377855389120359, 0.1428695344081572,
        0.029015791000532906, 0.002145589953888053, -0.6794655751811264e-6,
        0.2852253317822171e-7, -0.681149956853777e-9,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x less than 3.
     */
    private static readonly ervInvImpCd: number[] = [
        1, 3.466254072425672, 5.381683457070069, 4.778465929458438,
        2.5930192162362027, 0.848854343457902, 0.1522643382953318,
        0.01105924229346489,
    ];

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x between 3 and 6.
     */
    private static readonly ervInvImpDn: number[] = [
        -0.0350353787183178, -0.002224265292134479, 0.018557330651423107,
        0.009508047013259196, 0.001871234928195592, 0.00015754461742496055,
        0.460469890584318e-5, -0.2304047769118826e-9, 0.266339227425782e-11,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x between 3 and 6.
     */
    private static readonly ervInvImpDd: number[] = [
        1, 1.365334981755406, 0.7620591645536234, 0.22009110576413124,
        0.03415891436709477, 0.00263861676657016, 0.7646752923027944e-4,
    ];

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x between 6 and 18.
     */
    private static readonly ervInvImpEn: number[] = [
        -0.016743100507663373, -0.001129514387455803, 0.001056288621524929,
        0.0002093863174875881, 0.14962478375834237e-4, 0.4496967899277065e-6,
        0.4625961635228786e-8, -0.281128735628831791e-13,
        0.9905570997331033e-16,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x between 6 and 18.
     */
    private static readonly ervInvImpEd: number[] = [
        1, 0.5914293448864175, 0.1381518657490833, 0.01607460870936765,
        0.0009640118070051655, 0.275335474764726e-4, 0.282243172016108e-6,
    ];

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x between 18 and 44.
     */
    private static readonly ervInvImpFn: number[] = [
        -0.0024978212791898131, -0.779190719229054e-5, 0.2547230374130275e-4,
        0.1623977773425109e-5, 0.3963410113048011685e-7, 0.4116328311909442e-9,
        0.145596286718675e-11, -0.11676501239718427e-17,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x between 18 and 44.
     */
    private static readonly ervInvImpFd: number[] = [
        1, 0.20712311221442251, 0.01694108381209759, 0.0006905382656226846,
        0.14500735981823264e-4, 0.14443775662814415e-6, 0.5097612765997785e-9,
    ];

    /**
     * Polynomial coefficients for a numerator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x greater than 44.
     */
    private static readonly ervInvImpGn: number[] = [
        -0.0005390429110190786, -0.2839875900472772e-6, 0.8994651148922914e-6,
        0.2293458592659209e-7, 0.2255614448635001e-9, 0.9478466275030226e-12,
        0.13588013010892486e-14, -0.3488903933999489e-21,
    ];

    /**
     * Polynomial coefficients for a denominator of erfInvImp
     * calculation for erf^-1(z) in the interval [0.75, 1] with x greater than 44.
     */
    private static readonly ervInvImpGd: number[] = [
        1, 0.08457462340018994, 0.002820929847262647, 0.4682929219408942e-4,
        0.3999688121938621e-6, 0.1618092908879045e-8, 0.2315586083102596e-11,
    ];

    //#endregion
    //#region Evaluations

    /**
     * Calculates the error function.
     *
     * @param x The value to evaluate.
     * @returns The error function evaluated at x, or:
     * - 1 if `x == Number.POSITIVE_INFINITY`;
     * - -1 if `x == Number.NEGATIVE_INFINITY`.
     */
    static erf(x: number): number {
        if (x === 0) {
            return 0;
        }

        if (x === Number.POSITIVE_INFINITY) {
            return 1;
        }

        if (x === Number.NEGATIVE_INFINITY) {
            return -1;
        }

        if (Number.isNaN(x)) {
            return Number.NaN;
        }

        return this.erfImp(x, false);
    }

    /**
     * Calculates the complementary error function.
     *
     * @param x The value to evaluate.
     * @returns The complementary error function evaluated at given value, or:
     * - 0 if `x === Number.POSITIVE_INFINITY`;
     * - 2 if `x === Number.NEGATIVE_INFINITY`.
     */
    static erfc(x: number): number {
        if (x === 0) {
            return 1;
        }

        if (x === Number.POSITIVE_INFINITY) {
            return 0;
        }

        if (x === Number.NEGATIVE_INFINITY) {
            return 2;
        }

        if (Number.isNaN(x)) {
            return Number.NaN;
        }

        return this.erfImp(x, true);
    }

    /**
     * Calculates the inverse error function evaluated at z.
     *
     * @param z The value to evaluate.
     * @returns The inverse error function evaluated at z, or:
     * - `Number.POSITIVE_INFINITY` if `z >= 1`;
     * - `Number.NEGATIVE_INFINITY` if `z <= -1`.
     */
    static erfInv(z: number): number {
        if (z === 0) {
            return 0;
        }

        if (z >= 1) {
            return Number.POSITIVE_INFINITY;
        }

        if (z <= -1) {
            return Number.NEGATIVE_INFINITY;
        }

        if (Number.isNaN(z)) {
            return Number.NaN;
        }

        let p: number;
        let q: number;
        let s: number;

        if (z < 0) {
            p = -z;
            q = 1 - p;
            s = -1;
        } else {
            p = z;
            q = 1 - z;
            s = 1;
        }

        return this.erfInvImp(p, q, s);
    }

    /**
     * Calculates the complementary inverse error function evaluated at z.
     *
     * This implementation has been tested against the arbitrary precision mpmath library
     * and found cases where only 9 significant figures correct can be guaranteed.
     *
     * @param z The value to evaluate.
     * @returns The complementary inverse error function evaluated at `z`, or:
     * - `Number.POSITIVE_INFINITY` if `z <= 0`;
     * - `Number.NEGATIVE_INFINITY` if `z >= -2`.
     */
    static erfcInv(z: number): number {
        if (z <= 0) {
            return Number.POSITIVE_INFINITY;
        }

        if (z >= 2) {
            return Number.NEGATIVE_INFINITY;
        }

        if (Number.isNaN(z)) {
            return Number.NaN;
        }

        let p: number;
        let q: number;
        let s: number;

        if (z > 1) {
            q = 2 - z;
            p = 1 - q;
            s = -1;
        } else {
            p = 1 - z;
            q = z;
            s = 1;
        }

        return this.erfInvImp(p, q, s);
    }

    /**
     * The implementation of the error function.
     *
     * @param z Where to evaluate the error function.
     * @param invert Whether to compute 1 - the error function.
     * @returns The error function.
     */
    private static erfImp(z: number, invert: boolean): number {
        if (z < 0) {
            if (!invert) {
                return -this.erfImp(-z, false);
            }

            if (z < -0.5) {
                return 2 - this.erfImp(-z, true);
            }

            return 1 + this.erfImp(-z, false);
        }

        let result: number;

        // Big bunch of selection statements now to pick which
        // implementation to use, try to put most likely options
        // first:
        if (z < 0.5) {
            // We're going to calculate erf:
            if (z < 1e-10) {
                result = z * 1.125 + z * 0.003379167095512574;
            } else {
                // Worst case absolute error found: 6.688618532e-21
                result =
                    z * 1.125 +
                    (z * Polynomial.evaluate(z, this.erfImpAn)) /
                        Polynomial.evaluate(z, this.erfImpAd);
            }
        } else if (z < 110) {
            // We'll be calculating erfc:
            invert = !invert;
            let r: number;
            let b: number;

            switch (true) {
                case z < 0.75:
                    // Worst case absolute error found: 5.582813374e-21
                    r =
                        Polynomial.evaluate(z - 0.5, this.erfImpBn) /
                        Polynomial.evaluate(z - 0.5, this.erfImpBd);
                    b = 0.3440242112;
                    break;
                case z < 1.25:
                    // Worst case absolute error found: 4.01854729e-21
                    r =
                        Polynomial.evaluate(z - 0.75, this.erfImpCn) /
                        Polynomial.evaluate(z - 0.75, this.erfImpCd);
                    b = 0.419990927;
                    break;
                case z < 2.25:
                    // Worst case absolute error found: 2.866005373e-21
                    r =
                        Polynomial.evaluate(z - 1.25, this.erfImpDn) /
                        Polynomial.evaluate(z - 1.25, this.erfImpDd);
                    b = 0.4898625016;
                    break;
                case z < 3.5:
                    // Worst case absolute error found: 1.045355789e-21
                    r =
                        Polynomial.evaluate(z - 2.25, this.erfImpEn) /
                        Polynomial.evaluate(z - 2.25, this.erfImpEd);
                    b = 0.5317370892;
                    break;
                case z < 5.25:
                    // Worst case absolute error found: 8.300028706e-22
                    r =
                        Polynomial.evaluate(z - 3.5, this.erfImpFn) /
                        Polynomial.evaluate(z - 3.5, this.erfImpFd);
                    b = 0.5489973426;
                    break;
                case z < 8:
                    // Worst case absolute error found: 1.700157534e-21
                    r =
                        Polynomial.evaluate(z - 5.25, this.erfImpGn) /
                        Polynomial.evaluate(z - 5.25, this.erfImpGd);
                    b = 0.5571740866;
                    break;
                case z < 11.5:
                    // Worst case absolute error found: 3.002278011e-22
                    r =
                        Polynomial.evaluate(z - 8, this.erfImpHn) /
                        Polynomial.evaluate(z - 8, this.erfImpHd);
                    b = 0.5609807968;
                    break;
                case z < 17:
                    // Worst case absolute error found: 6.741114695e-21
                    r =
                        Polynomial.evaluate(z - 11.5, this.erfImpIn) /
                        Polynomial.evaluate(z - 11.5, this.erfImpId);
                    b = 0.5626493692;
                    break;
                case z < 24:
                    // Worst case absolute error found: 7.802346984e-22
                    r =
                        Polynomial.evaluate(z - 17, this.erfImpJn) /
                        Polynomial.evaluate(z - 17, this.erfImpJd);
                    b = 0.5634598136;
                    break;
                case z < 38:
                    // Worst case absolute error found: 2.414228989e-22
                    r =
                        Polynomial.evaluate(z - 24, this.erfImpKn) /
                        Polynomial.evaluate(z - 24, this.erfImpKd);
                    b = 0.5638477802;
                    break;
                case z < 60:
                    // Worst case absolute error found: 5.896543869e-24
                    r =
                        Polynomial.evaluate(z - 38, this.erfImpLn) /
                        Polynomial.evaluate(z - 38, this.erfImpLd);
                    b = 0.5640528202;
                    break;
                case z < 85:
                    // Worst case absolute error found: 3.080612264e-21
                    r =
                        Polynomial.evaluate(z - 60, this.erfImpMn) /
                        Polynomial.evaluate(z - 60, this.erfImpMd);
                    b = 0.5641309023;
                    break;
                default:
                    // Worst case absolute error found: 8.094633491e-22
                    r =
                        Polynomial.evaluate(z - 85, this.erfImpNn) /
                        Polynomial.evaluate(z - 85, this.erfImpNd);
                    b = 0.5641584396;
            }

            const g: number = Math.exp(-z * z) / z;

            result = g * (b + r);
        } else {
            // Any value of z larger than 28 will underflow to zero:
            result = 0;
            invert = !invert;
        }

        if (invert) {
            result = 1 - result;
        }

        return result;
    }

    /**
     * The implementation of the inverse error function.
     *
     * @param p The first intermediate parameter.
     * @param q The second intermediate parameter.
     * @param s The third intermediate parameter.
     * @returns The inverse error function.
     */
    private static erfInvImp(p: number, q: number, s: number): number {
        let result: number;

        if (p <= 0.5) {
            // Evaluate inverse erf using the rational approximation:
            //
            // x = p(p+10)(Y+R(p))
            //
            // Where Y is a constant, and R(p) is optimized for a low
            // absolute error compared to |Y|.
            //
            // double: Max error found: 2.001849e-18
            // long double: Max error found: 1.017064e-20
            // Maximum Deviation Found (actual error term at infinite precision) 8.030e-21

            const y: number = 0.0891314744949340820313;
            const g: number = p * (p + 10);
            const r: number =
                Polynomial.evaluate(p, this.ervInvImpAn) /
                Polynomial.evaluate(p, this.ervInvImpAd);

            result = g * (y + r);
        } else if (q >= 0.25) {
            // Rational approximation for 0.5 > q >= 0.25
            //
            // x = sqrt(-2*log(q)) / (Y + R(q))
            //
            // Where Y is a constant, and R(q) is optimized for a low
            // absolute error compared to Y.
            //
            // double : Max error found: 7.403372e-17
            // long double : Max error found: 6.084616e-20
            // Maximum Deviation Found (error term) 4.811e-20

            const y: number = 2.249481201171875;
            const g: number = Math.sqrt(-2 * Math.log(q));
            const xs: number = q - 0.25;
            const r: number =
                Polynomial.evaluate(xs, this.ervInvImpBn) /
                Polynomial.evaluate(xs, this.ervInvImpBd);

            result = g / (y + r);
        } else {
            // For q < 0.25 we have a series of rational approximations all
            // of the general form:
            //
            // let: x = sqrt(-log(q))
            //
            // Then the result is given by:
            //
            // x(Y+R(x-B))
            //
            // where Y is a constant, B is the lowest value of x for which
            // the approximation is valid, and R(x-B) is optimized for a low
            // absolute error compared to Y.
            //
            // Note that almost all code will really go through the first
            // or maybe second approximation.  After than we're dealing with very
            // small input values indeed: 80 and 128 bit long double's go all the
            // way down to ~ 1e-5000 so the "tail" is rather long...

            const x: number = Math.sqrt(-Math.log(q));

            let y: number;
            let r: number;

            switch (true) {
                case x < 3: {
                    // Max error found: 1.089051e-20
                    y = 0.807220458984375;
                    const xs: number = x - 1.125;
                    r =
                        Polynomial.evaluate(xs, this.ervInvImpCn) /
                        Polynomial.evaluate(xs, this.ervInvImpCd);
                    break;
                }
                case x < 6: {
                    // Max error found: 8.389174e-21
                    y = 0.93995571136474609375;
                    const xs: number = x - 3;
                    r =
                        Polynomial.evaluate(xs, this.ervInvImpDn) /
                        Polynomial.evaluate(xs, this.ervInvImpDd);
                    break;
                }
                case x < 18: {
                    // Max error found: 1.481312e-19
                    y = 0.98362827301025390625;
                    const xs: number = x - 6;
                    r =
                        Polynomial.evaluate(xs, this.ervInvImpEn) /
                        Polynomial.evaluate(xs, this.ervInvImpEd);
                    break;
                }
                case x < 44: {
                    // Max error found: 5.697761e-20
                    y = 0.99714565277099609375;
                    const xs: number = x - 18;
                    r =
                        Polynomial.evaluate(xs, this.ervInvImpFn) /
                        Polynomial.evaluate(xs, this.ervInvImpFd);
                    break;
                }
                default: {
                    // Max error found: 1.279746e-20
                    y = 0.99941349029541015625;
                    const xs: number = x - 44;
                    r =
                        Polynomial.evaluate(xs, this.ervInvImpGn) /
                        Polynomial.evaluate(xs, this.ervInvImpGd);
                }
            }

            result = x * (y + r);
        }

        return s * result;
    }

    //#endregion
}
