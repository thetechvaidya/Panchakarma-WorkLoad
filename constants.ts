import type { Scholar, ProcedureGradeInfo } from './types';
import { Gender } from './types';

export const INITIAL_SCHOLARS: Scholar[] = [
  // 1st Year
  { id: 's1', name: 'Dr. Akash', year: 1, gender: Gender.MALE, isPosted: true },
  { id: 's2', name: 'Dr. Pratibha', year: 1, gender: Gender.FEMALE, isPosted: true },
  { id: 's3', name: 'Dr. Kamini', year: 1, gender: Gender.FEMALE, isPosted: true },
  // 2nd Year
  { id: 's4', name: 'Dr. Ritu', year: 2, gender: Gender.FEMALE, isPosted: true },
  { id: 's5', name: 'Dr. Anjali', year: 2, gender: Gender.FEMALE, isPosted: true },
  { id: 's6', name: 'Dr. Ayushi', year: 2, gender: Gender.FEMALE, isPosted: false },
  { id: 's7', name: 'Dr. Jolly', year: 2, gender: Gender.FEMALE, isPosted: false },
  // 3rd Year
  { id: 's8', name: 'Dr. Deepak', year: 3, gender: Gender.MALE, isPosted: false },
  { id: 's9', name: 'Dr. Aniket', year: 3, gender: Gender.MALE, isPosted: false },
  { id: 's10', name: 'Dr. Satrughna', year: 3, gender: Gender.MALE, isPosted: true },
  { id: 's11', name: 'Dr. Ritika', year: 3, gender: Gender.FEMALE, isPosted: false },
];

export const PROCEDURE_GRADES: Record<string, ProcedureGradeInfo> = {
  // Grade 1 - High intensity (3 points)
  'ssps': { grade: 1, points: 3, name: 'Shastik Shali Pinda Swedana', code: 'SSPS' },
  'shashik-shali pinda swedana': { grade: 1, points: 3, name: 'Shastik Shali Pinda Swedana', code: 'SSPS' },
  'shastika shali pinda sweda sarvanga': { grade: 1, points: 3, name: 'Shastik Shali Pinda Swedana', code: 'SSPS' },
  'jalaukavacharana': { grade: 1, points: 3, name: 'Jalaukavacharana', code: 'JALAU' },
  'vamana': { grade: 1, points: 3, name: 'Vamana (incl. Abhyanga & Swedana)', code: 'VAMANA' },
  'nirhua basti': { grade: 1, points: 3, name: 'Karma Basti', code: 'KARMA_BASTI' },
  'karma basti': { grade: 1, points: 3, name: 'Karma Basti', code: 'KARMA_BASTI' },
  'nb': { grade: 1, points: 3, name: 'Karma Basti', code: 'KARMA_BASTI' },
  'saravang abhyang + potali': { grade: 1, points: 3, name: 'Sarvanga Abhyanga & Potali Swedana', code: 'SAR_AB_POT' },
  'shiro-basti': { grade: 1, points: 3, name: 'Shiro Basti', code: 'SHIRO_BASTI' },
  'pizhichil': { grade: 1, points: 3, name: 'Pizhichil / Sarvanga Dhara', code: 'SAR_DHARA' },
  'sarvang parikshek': { grade: 1, points: 3, name: 'Pizhichil / Sarvanga Dhara', code: 'SAR_DHARA' },
  'sarvanag dhara': { grade: 1, points: 3, name: 'Pizhichil / Sarvanga Dhara', code: 'SAR_DHARA' },
  'sarvanga dhara': { grade: 1, points: 3, name: 'Pizhichil / Sarvanga Dhara', code: 'SAR_DHARA' },
  'sarvang udwartana': { grade: 1, points: 3, name: 'Sarvanga Udwartana', code: 'UDWARTANA' },
  'takradhara': { grade: 1, points: 3, name: 'Takradhara', code: 'TAKRADHARA' },

  // Grade 2 - Medium intensity (2 points)
  'virechana': { grade: 2, points: 2, name: 'Virechana', code: 'VIRECHANA' },
  'sarvanga ruksha sweda': { grade: 2, points: 2, name: 'Sarvanga Ruksha Sweda', code: 'SAR_RUKSHA' },
  'shiroabhyanga': { grade: 2, points: 2, name: 'Shiroabhyanga', code: 'SHIRO_AB' },
  'janu-basti': { grade: 2, points: 2, name: 'Janu Basti', code: 'JANU_BASTI' },
  'jb': { grade: 2, points: 2, name: 'Janu Basti', code: 'JANU_BASTI' },
  'manya-basti': { grade: 2, points: 2, name: 'Manya Basti', code: 'MANYA_BASTI' },
  'kati basti': { grade: 2, points: 2, name: 'Kati Basti', code: 'KATI_BASTI' },
  'prishta basti': { grade: 2, points: 2, name: 'Prishta Basti', code: 'PRISHTA_BASTI' },
  'sthanik potali + abhyang': { grade: 2, points: 2, name: 'Sthanika Abhyanga & Potali Swedana', code: 'STH_AB_POT' },
  'sarvang abhyanga swedan': { grade: 2, points: 2, name: 'Sarvanga Abhyanga & Swedana', code: 'SAR_AB_SW' },
  'pps': { grade: 2, points: 2, name: 'Sthanika Abhyanga & Potali Swedana', code: 'STH_AB_POT' },
  'jps': { grade: 2, points: 2, name: 'Sthanika Abhyanga & Potali Swedana', code: 'STH_AB_POT' },
  'ruksha sweda': { grade: 2, points: 2, name: 'Ruksha Swedana', code: 'RUKSHA_SW' },
  'ruksha swed': { grade: 2, points: 2, name: 'Ruksha Swedana', code: 'RUKSHA_SW' },
  'upanhana': { grade: 2, points: 2, name: 'Upanaha', code: 'UPANAHA' },
  'sthanik dhara/parishek': { grade: 2, points: 2, name: 'Sthanika Dhara (Parisheka)', code: 'STH_DHARA' },
  'parisheka': { grade: 2, points: 2, name: 'Sthanika Dhara (Parisheka)', code: 'STH_DHARA' },
  'janu parisheka': { grade: 2, points: 2, name: 'Sthanika Dhara (Parisheka)', code: 'STH_DHARA' },
  'shirodhara': { grade: 2, points: 2, name: 'Shirodhara', code: 'SHIRODHARA' },
  
  // Grade 3 - Low intensity (1 point)
  'sthanik ruksha swedana': { grade: 3, points: 1, name: 'Sthanika Ruksha Swedana', code: 'STH_RUKSHA' },
  'nasya': { grade: 3, points: 1, name: 'Nasya', code: 'NASYA' },
  'anuvasan basti': { grade: 3, points: 1, name: 'Anuvasana Basti', code: 'ANU_BASTI' },
  'ab': { grade: 3, points: 1, name: 'Anuvasana Basti', code: 'ANU_BASTI' },
  'matra basti': { grade: 3, points: 1, name: 'Matra Basti', code: 'MATRA_BASTI' },
  'sarvanga vaspa sweda': { grade: 3, points: 1, name: 'Sarvanga Vaspa Sweda', code: 'SAR_VASPA' },
  'sthanika abhyanga': { grade: 3, points: 1, name: 'Sthanika Abhyanga', code: 'STH_AB' },
  'shiro-pichu': { grade: 3, points: 1, name: 'Shiro Pichu', code: 'SHIRO_PICHU' },
  'agni karma': { grade: 3, points: 1, name: 'Agni Karma', code: 'AGNI_KARMA' },
  'siravedha': { grade: 3, points: 1, name: 'Siravedha', code: 'SIRAVEDHA' },
  'sthanika abhyanga swedana': { grade: 3, points: 1, name: 'Sthanika Abhyanga & Swedana', code: 'STH_AB_SW' },
  'abhyanga swedan': { grade: 3, points: 1, name: 'Abhyanga & Swedana', code: 'AB_SW' },
  'abhyanga': { grade: 3, points: 1, name: 'Abhyanga', code: 'ABHYANGA' },
  'pichu': { grade: 3, points: 1, name: 'Pichu', code: 'PICHU' },
  'sarvang swedan': { grade: 3, points: 1, name: 'Sarvanga Swedana', code: 'SAR_SW' },
  'sarvanga sweda': { grade: 3, points: 1, name: 'Sarvanga Swedana', code: 'SAR_SW' },
  'lepa': { grade: 3, points: 1, name: 'Lepa', code: 'LEPA' },
  'udar lepa': { grade: 3, points: 1, name: 'Udar Lepa', code: 'UDAR_LEPA' },
  'karnapurana': { grade: 3, points: 1, name: 'Karnapurana', code: 'KARNAPURANA' },
  'tarpana': { grade: 3, points: 1, name: 'Tarpana', code: 'TARPANA' },
  'vesthana': { grade: 3, points: 1, name: 'Vesthana', code: 'VESTHANA' },
  'avgah sweda': { grade: 3, points: 1, name: 'Avagaha Swedana', code: 'AVAGAHA' },
  'nadi swedana': { grade: 3, points: 1, name: 'Nadi Swedana', code: 'NADI_SW' },
};

// Sort keys by length descending to match longer phrases first
export const SORTED_PROCEDURE_KEYS = Object.keys(PROCEDURE_GRADES).sort((a, b) => b.length - a.length);

export const YEAR_WEIGHTS: Record<number, number> = {
  1: 21, // 1st Year Scholars
  2: 15, // 2nd Year Scholars
  3: 7,  // 3rd Year Scholars
};


export const DEFAULT_FEMALE_INPUT_TEXT = `1) Champa - 16th PPS+ 8th AB (Vatsmayantaka ghrita + Amritadi taila)+ 13th kati basti with Sahacharadi oil + 13th pichu with Sahacharadi oil over rt toe + *fasting and pps data
4) Parveen Bano- 4th janu basti with murchhita Tila taila+ 3rd AB  
5) Chandra devi - 11th PPS + 5th NB + 7th sarvanga sweda
6) Chandrawati - 8th AB + ruksha swed with cotton over painfull joint
7) Roshni- Abhyanga Swedana over Kati and udar pradesh + 5th AB
8) Nishu - 3rd Sarvanga Abhyanga Swedana 
9) Parveen- 10th Janu parisheka also on popliteal Fossa with balashwagandhadi taila + 6th AB 
10) saira khatoon- 3rd NB  + 4th janu basti with murchhita Tila taila + nadi Swedana over Manya Kati pradesh
11) Radha - 4th AB + 6th sarvanga swedan
12) vimlesh -4th AB Ksheerabala taila+ 7th JB with murchit tila taila 
13) shanti - 4th AB  + 6th sarvanga swedan
14) Shashi- 4thJPS over cervical and b/l shoulder joint+ 5th Manya basti+ 5th matra basti with sahachardi taila`;

export const DEFAULT_MALE_INPUT_TEXT = `2) omprakash(M)- 4th AB +8th kati basti with murchit tila taila 
3) Swami(M) -10th Sarvanga swedana + 7th AB with valiya amrutadi taila + 14th PPS over kati and hip joint
4) Narendra(M) -9th Udar lepa + 8th avgah sweda
5) Virender(M) -3rd AB + kati and udar pradesh abhyanga Swedan`;
