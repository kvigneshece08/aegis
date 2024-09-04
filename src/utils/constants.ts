export const TIMES_OF_THE_DAY = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Morning',
    value: 'morning',
  },
  {
    label: 'Afternoon',
    value: 'afternoon',
  },
  {
    label: 'Evening',
    value: 'evening',
  },
  {
    label: 'Night',
    value: 'night',
  },
];
export const CLIMATE_DATA = [
  {
    label: 'Sunny',
    value: 'sunny',
  },
  {
    label: 'Windy',
    value: 'windy',
  },
  {
    label: 'Rainy',
    value: 'rainy',
  },
  {
    label: 'Foggy',
    value: 'foggy',
  },
  {
    label: 'Clear',
    value: 'clear',
  },
  {
    label: 'Cloudy',
    value: 'cloudy',
  },
];
export const WIND_DATA = [
  {
    label: 'None',
    value: 'none',
  },
  {
    label: 'Light',
    value: 'light',
  },
  {
    label: 'Medium',
    value: 'medium',
  },
  {
    label: 'Strong',
    value: 'strong',
  },
  {
    label: 'Stormy',
    value: 'stormy',
  },
];
export const contractorFirmVal = {
  contractorCompany: '',
  contractorFunction: '',
  contractorTotalEmp: null,
  contractorTotalWorkingHrs: null,
  contractorNotes: '',
};
export const workPerformedVal = {
  activityName: '',
  workerCount: '',
  activityType: 'other',
  variationNumber: '',
  variationRemarks: '',
  docketNumber: '',
  workNotes: '',
};
export const machineryAndEquipmentVal = {
  machineryAndEquipmentName: '',
  machineryAndEquipmentNumber: '',
  machineryAndEquipmentLocationUsed: '',
  machineryAndEquipmentNotes: '',
};
export const overTimeDetailVal = {
  overTimeActivityName: '',
  overTimeTotalWorker: '',
  timeOfStart: '',
  timeOfFinish: '',
  overTimeTotalWorkingHrs: '',
  overTimeNotes: '',
};
export const DELAY_TYPE = [
  {
    label: 'Delay',
    value: 'delay',
  },
  {
    label: 'Disruption',
    value: 'disruption',
  },
];
export const SHIFT_TYPE = [
  {
    label: 'Day',
    value: 'day',
  },
  {
    label: 'Night',
    value: 'night',
  },
  {
    label: 'OnGoing',
    value: 'ongoing',
  },
];

export const PREPOPULATED_CAUSEDELAY_TYPE = [
  {
    label: 'Inclement Weather',
    value: 'Inclement Weather',
  },
  {
    label: 'Design change',
    value: 'Design change',
  },
  {
    label: 'Delayed site access',
    value: 'Delayed site access',
  },
  {
    label: 'Delay in approval',
    value: 'Delay in approval',
  },
  {
    label: 'Delay due to other sub-contractors',
    value: 'Delay due to other sub-contractors',
  },
  {
    label: 'Change in scope',
    value: 'Change in scope',
  },
  {
    label: 'Delay in approvals from Government',
    value: 'Delay in approvals from Government',
  },
  {
    label: 'Lack of working space',
    value: 'Lack of working space',
  },
  {
    label: 'Unsafe working conditions',
    value: 'Unsafe working conditions',
  },
  {
    label: 'Change in sequence of construction',
    value: 'Change in sequence of construction',
  },
];

export const WORK_ACTIVITY_TYPE = [
  {
    label: 'Contract Works',
    value: 'contract_works',
  },
  {
    label: 'Defect Works',
    value: 'defect_works',
  },
  {
    label: 'Variation Works',
    value: 'variation_works',
  },
  {
    label: 'Day Works',
    value: 'day_works',
  },
  {
    label: 'Other',
    value: 'other',
  },
];

export const YES_NO_OPTION = [
  {
    label: 'Yes',
    value: 'yes',
  },
  {
    label: 'No',
    value: 'no',
  },
];

export const PREPOPULATED_MACHINERY_NAMES = [
  { label: 'Austrak 56m Boom Pump', 
    value: 'Austrak 56m Boom Pump'
  },
  { label: 'Austrak 48m Boom Pump', 
    value: 'Austrak 48m Boom Pump'
  },
  { label: 'Speed Pro 38m Boom Pump', 
    value: 'Speed Pro 38m Boom Pump'
  },
  { label: 'Alfasi 20T Articulated Mobile Crane (Franna)', 
    value: 'Alfasi 20T Articulated Mobile Crane (Franna)'
  },
  { label: 'Rigweld 25T Franna', 
    value: 'Rigweld 25T Franna'
  },
  { label: 'Laser Screed', 
    value: 'Laser Screed'
  },
  { label: 'Laser Levelling tractor', 
    value: 'Laser Levelling tractor'
  },
  { label: 'Trowel Machines', 
    value: 'Trowel Machines'
  },
  { label: 'Containers', 
    value: 'Containers'
  },
  { label: 'Site Office', 
    value: 'Site Office'
  },
  { label: 'Speed Pro Telehandler 2.5T', 
    value: 'Speed Pro Telehandler 2.5T'
  },
  { label: 'Light Towers Speed Pro', 
    value: 'Light Towers Speed Pro'
  },
  { label: 'Light Towers Alfasi', 
    value: 'Light Towers Alfasi'
  },
  { label: 'Alfasi 4T Telehandler', 
    value: 'Alfasi 4T Telehandler'
  },
  { label: 'Acrow North Beam formwork', 
    value: 'Acrow North Beam formwork'
  },
  { label: 'Acrow South Beam formwork', 
    value: 'Acrow South Beam formwork'
  },
  { label: 'Acrow Back Blinding formwork', 
    value: 'Acrow Back Blinding formwork'
  },
  { label: 'Acrow West Beam formwork', 
    value: 'Acrow West Beam formwork'
  },
  { label: 'Acrow East Beam formwork', 
    value: 'Acrow East Beam formwork'
  },
  { label: 'Speed Pro Able Generator 25KvA', 
    value: 'Speed Pro Able Generator 25KvA'
  },
  { label: 'Speed Pro Staff Carrying vehicles', 
    value: 'Speed Pro Staff Carrying vehicles'
  },
  { label: 'Speed Pro material Carrying vehicles', 
    value: 'Speed Pro material Carrying vehicles'
  },
  { label: 'SCF Containers', 
    value: 'SCF Containers'
  },
  { label: 'Speed Pro Containers', 
    value: 'Speed Pro Containers'
  },
  { label: 'Speed Pro barricades (Metal)', 
    value: 'Speed Pro barricades (Metal)'
  },
  { label: 'Makinex Pressure Washer machine', 
    value: 'Makinex Pressure Washer machine'
  },
  { label: 'Honda Pressure Washer machine', 
    value: 'Honda Pressure Washer machine'
  },
  { label: 'Gas welding machine', 
    value: 'Gas welding machine'
  },
  { label: 'Hilti Drilling machine', 
    value: 'Hilti Drilling machine'
  },
  { label: 'Hilti Vaccum machine', 
    value: 'Hilti Vaccum machine'
  }
];

export const PREPOPULATED_SUB_CONTRACTORS = [
  { 
    label: 'Alfasi Equipment Hire P/L',
    value: 'Alfasi Equipment Hire P/L'
  },
  { 
    label: 'ALLCON GROUP PTY LTD',
    value: 'ALLCON GROUP PTY LTD'
  },
  { 
    label: 'Allcott Hire',
    value: 'Allcott Hire'
  },
  { 
    label: 'Allfasteners Pty Ltd',
    value: 'Allfasteners Pty Ltd'
  },
  { 
    label: 'Alpha Reo Pty Ltd',
    value: 'Alpha Reo Pty Ltd'
  },
  { 
    label: 'Anco Bolt Engineering',
    value: 'Anco Bolt Engineering'
  },
  { 
    label: 'BIG RIVER GROUP PTY LTD',
    value: 'BIG RIVER GROUP PTY LTD'
  },
  { 
    label: 'BUNNINGS GROUP LIMITED',
    value: 'BUNNINGS GROUP LIMITED'
  },
  { 
    label: 'COATES HIRE',
    value: 'COATES HIRE'
  },
  { 
    label: 'Concrete Repair Products',
    value: 'Concrete Repair Products'
  },
  { 
    label: 'Danterr Pty Ltd',
    value: 'Danterr Pty Ltd'
  },
  { 
    label: 'Evolve Prefabrication Pty Ltd',
    value: 'Evolve Prefabrication Pty Ltd'
  },
  { 
    label: 'Hanson Heidelberg Cement',
    value: 'Hanson Heidelberg Cement'
  },
  { 
    label: 'HILTI (AUST) PTY LTD',
    value: 'HILTI (AUST) PTY LTD'
  },
  { 
    label: 'InfraBuild Construction',
    value: 'InfraBuild Construction'
  },
  { 
    label: 'Ioannou Coetus Australasia',
    value: 'Ioannou Coetus Australasia'
  },
  { 
    label: 'Jaybro',
    value: 'Jaybro'
  },
  { 
    label: 'Joe Arcaro & Associates P/L',
    value: 'Joe Arcaro & Associates P/L'
  },
  { 
    label: 'Kencor Sales',
    value: 'Kencor Sales'
  },
  { 
    label: 'KENNARDS HIRE',
    value: 'KENNARDS HIRE'
  },
  { 
    label: 'LASER LEVELLING AUSTRALIA',
    value: 'LASER LEVELLING AUSTRALIA'
  },
  { 
    label: 'Laser Screed Services Pty Ltd',
    value: 'Laser Screed Services Pty Ltd'
  },
  { 
    label: 'Onsite Rental Group Pty Ltd',
    value: 'Onsite Rental Group Pty Ltd'
  },
  { 
    label: 'Outright Surveying',
    value: 'Outright Surveying'
  },
  { 
    label: 'POPS Industrial',
    value: 'POPS Industrial'
  },
  { 
    label: 'SpeedPro Industries',
    value: 'SpeedPro Industries'
  },
  { 
    label: 'Rigweld Crane Hire',
    value: 'Rigweld Crane Hire'
  },
  { 
    label: 'Star Aluminium',
    value: 'Star Aluminium'
  },
  { 
    label: 'STAR ENGINEERING FABRICATION',
    value: 'STAR ENGINEERING FABRICATION'
  },
  { 
    label: 'Viking Woodworks',
    value: 'Viking Woodworks'
  },
  { 
    label: 'Wright Stone Trading Pty Ltd',
    value: 'Wright Stone Trading Pty Ltd' 
  }
];
