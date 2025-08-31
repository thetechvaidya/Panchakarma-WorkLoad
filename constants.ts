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
  // Grade 1 - High intensity (5 points)
  'ssps': { grade: 1, points: 5, name: 'Shashik-Shali Pinda Swedana' },
  'shashik-shali pinda swedana': { grade: 1, points: 5, name: 'Shashik-Shali Pinda Swedana' },
  'nirhua basti': { grade: 1, points: 5, name: 'Nirhua Basti' },
  'nb': { grade: 1, points: 5, name: 'Nirhua Basti' },
  'saravang abhyang + potali': { grade: 1, points: 5, name: 'Saravang Abhyang + Potali' },
  'shiro-basti': { grade: 1, points: 5, name: 'Shiro-Basti' },
  'sarvang parikshek': { grade: 1, points: 5, name: 'Sarvang Parikshek' },
  'pizhichil': { grade: 1, points: 5, name: 'Pizhichil' },
  'sarvanag dhara': { grade: 1, points: 5, name: 'Sarvanag Dhara' },
  'sarvang udwartana': { grade: 1, points: 5, name: 'Sarvang Udwartana' },

  // Grade 2 - Medium intensity (3 points)
  'janu-basti': { grade: 2, points: 3, name: 'Janu-Basti' },
  'manya-basti': { grade: 2, points: 3, name: 'Manya-Basti' },
  'kati basti': { grade: 2, points: 3, name: 'Kati Basti' },
  'prishta basti': { grade: 2, points: 3, name: 'Prishta Basti' },
  'sthanik potali + abhyang': { grade: 2, points: 3, name: 'Sthanik Potali + Abhyang' },
  'sarvang abhyanga swedan': { grade: 2, points: 3, name: 'Sarvang Abhyanga Swedan' },
  'pps': { grade: 2, points: 3, name: 'Sthanik Abhyang + Potali (PPS)' },
  'jps': { grade: 2, points: 3, name: 'Sthanik Abhyang + Potali (JPS)' },
  'sthanik ruksha swedana': { grade: 2, points: 3, name: 'Sthanik Ruksha Swedana' },
  'ruksha sweda': { grade: 2, points: 3, name: 'Ruksha Sweda' },
  'upanhana': { grade: 2, points: 3, name: 'Upanhana' },
  'sthanik dhara/parishek': { grade: 2, points: 3, name: 'Sthanik Dhara/Parishek' },
  'parisheka': { grade: 2, points: 3, name: 'Parisheka' },
  'janu parisheka': { grade: 2, points: 3, name: 'Janu Parisheka' },
  'shirodhara': { grade: 2, points: 3, name: 'Shirodhara' },
  'takradhara': { grade: 2, points: 3, name: 'Takradhara' },
  'nasya': { grade: 2, points: 3, name: 'Nasya' },
  
  // Grade 3 - Low intensity (1 point)
  'sthanika abhyanga swedana': { grade: 3, points: 1, name: 'Sthanika Abhyanga Swedana' },
  'abhyanga swedan': { grade: 3, points: 1, name: 'Abhyanga Swedan' },
  'abhyanga': { grade: 3, points: 1, name: 'Abhyanga' },
  'pichu': { grade: 3, points: 1, name: 'Pichu' },
  'shiroabhyanga': { grade: 3, points: 1, name: 'Shiroabhyanga' },
  'sarvang swedan': { grade: 3, points: 1, name: 'Sarvang Swedan' },
  'anuvasan basti': { grade: 3, points: 1, name: 'Anuvasan Basti' },
  'ab': { grade: 3, points: 1, name: 'Anuvasan Basti' },
  'matra basti': { grade: 3, points: 1, name: 'Matra Basti' },
  'lepa': { grade: 3, points: 1, name: 'Lepa' },
  'udar lepa': { grade: 3, points: 1, name: 'Udar Lepa' },
  'karnapurana': { grade: 3, points: 1, name: 'Karnapurana' },
  'tarpana': { grade: 3, points: 1, name: 'Tarpana' },
  'vesthana': { grade: 3, points: 1, name: 'Vesthana' },
  'avgah sweda': { grade: 3, points: 1, name: 'Avgah Sweda' },
  'pachan': { grade: 3, points: 1, name: 'Pachan' },
  'deepan pachan': { grade: 3, points: 1, name: 'Deepan Pachan' },
};

// Sort keys by length descending to match longer phrases first
export const SORTED_PROCEDURE_KEYS = Object.keys(PROCEDURE_GRADES).sort((a, b) => b.length - a.length);

export const BASE_PATIENT_CAPACITY_PER_YEAR: Record<number, number> = {
  1: 3, // 1st Year Scholars base allocation
  2: 2, // 2nd Year Scholars base allocation
  3: 1, // 3rd Year Scholars base allocation
};

export const MAX_PATIENT_CAPACITY_PER_YEAR: Record<number, number> = {
  1: 4, // 1st Year Scholars max allocation
  2: 3, // 2nd Year Scholars max allocation
  3: 2, // 3rd Year Scholars max allocation
};


export const DEFAULT_INPUT_TEXT = `Procedures for 31/08/25

♀Females (12) 

1) Babita-  7th abhyanga over lower back , cervical region and b/l lower limb (ant. And post. More on cervical) f/b pps  + 5th AB (sahacharadi taila) Dr Kamini + Physiotherapy Consultation
2)  nazreen- 10th parisheka with dashamula kwath + 5th NB with Dashmula Panchtikta  Dr Ayushi
3) fiza - attendant
4) Champa - 9th  pps + 5th AB (Amritadi taila+ Vatsmayantaka ghrita))+ 6th  kati basti with Sahacharadi oil + 6th pichu with Sahacharadi oil over rt toe + Consultation with Saurabh Sir  Dr Ayushi
5) Pooja - attendant 
6) Rajkumari - 4th NB (yashtyadi) + abhyanga swedan on kati and udar Pradesh Dr kamini
7) Memun nisha - 2nd Sarvanga Abhyanga Swedana Dr Anjali
8) Chandra devi - 3rd PPS + 2nd AB Dashmula taila.Dr Anjali
9) Chandrawati - 7th sarvang swedan (do bp before sarvang swedan)  + 3rd NB  Dr Kamini
10) Roshni- Abhyanga Swedana over Kati and udar pradesh+ 2nd AB with triphaladi taila Dr Anjali
11) Nishu - pachan with chitrakadi vati
12)Parveen- 2nd Janu parisheka with balaashwagandhadi taila + 1st NB  Dashmula Panchtikta ksheer basti (yoga basti) * Dr Kamini*

♂Male (6)

1)Jagprasad- 4th day snehapan with varunadi ghrita  + 6th SSPS Dr Akash do ssps late , after pachan of sneha ( stop ssps from Monday)
2) Sandeep  - 13th Manya basti ( Murchitta tila taila) + 7th AB balaguduchyadi taila Dr Satrughna  
3) Moolchand -  10th  kati basti ( Mahanarayan taila) + 9th PPS (morning+Eve)2 times pps+ 4th abhyanga f/b dashmula parishek over kati Pradesh and b/l lower limb+ 1st Ruksha sweda over abdomen Dr Aakash 
4) Swami -3rd Sarvanga swedana + 3rd AB Amritadi taila  (only after P/A)  Dr Satrughna
5) Ashish - Sthanika Abhyanga Swedana+ Attendant Dr Satrughna
6) Narendra -2nd Udar lepa, 1st avgah sweda + 1st avgaha sweda Dr Aakash

OPD BASIS
Not Any
`;