import CheckboxFilter from './CheckboxFilter';

interface FilterBarProps {
  selectedEmploymentKind: any;
  setSelectedEmploymentKind: any;
  selectedSalaryFrequency: any;
  setSelectedSalaryFrequency: any;
  selectedAgencies: any;
  setSelectedAgencies: any;
}

export function FilterBar({
  selectedEmploymentKind,
  setSelectedEmploymentKind,
  selectedSalaryFrequency,
  setSelectedSalaryFrequency,
  selectedAgencies,
  setSelectedAgencies

}: FilterBarProps ) {

  return(
    <>
      <CheckboxFilter
        id="employmentType"
        label="Employment Type"
        options={[
          { value: 'F', label: 'Full-Time' },
          { value: 'P', label: 'Part-Time' },
        ]}
        selected={selectedEmploymentKind}
        onChange={setSelectedEmploymentKind}
      />
      <CheckboxFilter
        id="salary_frequency"
        label="Salary Frequency"
        options={[
          { value: 'Annual', label: 'Annual' },
          { value: 'Hourly', label: 'Hourly' },
        ]}
        selected={selectedSalaryFrequency}
        onChange={setSelectedSalaryFrequency}
      />
      <CheckboxFilter
        id="agency"
        label="Agency"
        options={[
          { value: "ADMIN FOR CHILDREN'S SVCS", label: "Admin for Children's Services" },
          { value: "ADMIN TRIALS AND HEARINGS", label: "Admin Trials and Hearings" },
          { value: "BOARD OF CORRECTION", label: "Board of Correction" },
          { value: "BOROUGH PRESIDENT-BRONX", label: "Borough President-Bronx" },
          { value: "BRONX COMMUNITY BOARD #4", label: "Bronx Community Board #4" },
          { value: "BRONX COMMUNITY BOARD #5", label: "Bronx Community Board #5" },
          { value: "BRONX COMMUNITY BOARD #8", label: "Bronx Community Board #8" },
          { value: "BRONX DISTRICT ATTORNEY", label: "Bronx District Attorney" },
          { value: "BUSINESS INTEGRITY COMMISSION", label: "Business Integrity Commission" },
          { value: "CAMPAIGN FINANCE BOARD", label: "Campaign Finance Board" },
          { value: "CIVILIAN COMPLAINT REVIEW BD", label: "Civilian Complaint Review Bd" },
          { value: "CONFLICTS OF INTEREST BOARD", label: "Conflicts of Interest Board" },
          { value: "CONSUMER AND WORKER PROTECTION", label: "Consumer and Worker Protection" },
          { value: "DEPARTMENT FOR THE AGING", label: "Department for the Aging" },
          { value: "DEPARTMENT OF BUILDINGS", label: "Department of Buildings" },
          { value: "DEPARTMENT OF BUSINESS SERV.", label: "Department of Business Services" },
          { value: "DEPARTMENT OF CITY PLANNING", label: "Department of City Planning" },
          { value: "DEPARTMENT OF CORRECTION", label: "Department of Correction" },
          { value: "DEPARTMENT OF FINANCE", label: "Department of Finance" },
          { value: "DEPARTMENT OF INVESTIGATION", label: "Department of Investigation" },
          { value: "DEPARTMENT OF PROBATION", label: "Department of Probation" },
          { value: "DEPARTMENT OF SANITATION", label: "Department of Sanitation" },
          { value: "DEPARTMENT OF TRANSPORTATION", label: "Department of Transportation" },
          { value: "DEPT OF CITYWIDE ADMIN SVCS", label: "Dept of Citywide Admin Services" },
          { value: "DEPT OF DESIGN & CONSTRUCTION", label: "Dept of Design & Construction" },
          { value: "DEPT OF ENVIRONMENT PROTECTION", label: "Dept of Environment Protection" },
          { value: "DEPT OF HEALTH/MENTAL HYGIENE", label: "Dept of Health/Mental Hygiene" },
          { value: "DEPT. OF HOMELESS SERVICES", label: "Dept. of Homeless Services" },
          { value: "DEPT OF PARKS & RECREATION", label: "Dept of Parks & Recreation" },
          { value: "DEPT OF YOUTH & COMM DEV SRVS", label: "Dept of Youth & Comm Dev Services" },
          { value: "DISTRICT ATTORNEY KINGS COUNTY", label: "District Attorney Kings County" },
          { value: "DISTRICT ATTORNEY-MANHATTAN", label: "District Attorney-Manhattan" },
          { value: "DISTRICT ATTORNEY RICHMOND COU", label: "District Attorney Richmond Cou" },
          { value: "FINANCIAL INFO SVCS AGENCY", label: "Financial Info Services Agency" },
          { value: "FIRE DEPARTMENT", label: "Fire Department" },
          { value: "HOUSING PRESERVATION & DVLPMNT", label: "Housing Preservation & Development" },
          { value: "HRA/DEPT OF SOCIAL SERVICES", label: "HRA/Dept of Social Services" },
          { value: "HUMAN RIGHTS COMMISSION", label: "Human Rights Commission" },
          { value: "LANDMARKS PRESERVATION COMM", label: "Landmarks Preservation Comm" },
          { value: "LAW DEPARTMENT", label: "Law Department" },
          { value: "MANHATTAN COMMUNITY BOARD #12", label: "Manhattan Community Board #12" },
          { value: "MANHATTAN COMMUNITY BOARD #5", label: "Manhattan Community Board #5" },
          { value: "MAYORS OFFICE OF CONTRACT SVCS", label: "Mayors Office of Contract Services" },
          { value: "MUNICIPAL WATER FIN AUTHORITY", label: "Municipal Water Fin Authority" },
          { value: "NYC DEPT OF VETERANS' SERVICES", label: "NYC Dept of Veterans' Services" },
          { value: "NYC EMPLOYEES RETIREMENT SYS", label: "NYC Employees Retirement Sys" },
          { value: "NYC FIRE PENSION FUND", label: "NYC Fire Pension Fund" },
          { value: "NYC HOUSING AUTHORITY", label: "NYC Housing Authority" },
          { value: "NYC POLICE PENSION FUND", label: "NYC Police Pension Fund" },
          { value: "OFFICE OF CRIMINAL JUSTICE", label: "Office of Criminal Justice" },
          { value: "OFFICE OF EMERGENCY MANAGEMENT", label: "Office of Emergency Management" },
          { value: "OFFICE OF LABOR RELATIONS", label: "Office of Labor Relations" },
          { value: "OFFICE OF MANAGEMENT & BUDGET", label: "Office of Management & Budget" },
          { value: "OFFICE OF THE ACTUARY", label: "Office of the Actuary" },
          { value: "OFFICE OF THE COMPTROLLER", label: "Office of the Comptroller" },
          { value: "OFFICE OF THE MAYOR", label: "Office of the Mayor" },
          { value: "OFF OF PAYROLL ADMINISTRATION", label: "Off of Payroll Administration" },
          { value: "POLICE DEPARTMENT", label: "Police Department" },
          { value: "PUBLIC ADMINISTRATOR-NEW YORK", label: "Public Administrator-New York" },
          { value: "TAX COMMISSION", label: "Tax Commission" },
          { value: "TAXI & LIMOUSINE COMMISSION", label: "Taxi & Limousine Commission" },
          { value: "TEACHERS RETIREMENT SYSTEM", label: "Teachers Retirement System" },
          { value: "TECHNOLOGY & INNOVATION", label: "Technology & Innovation" }
        ]}
        selected={selectedAgencies}
        onChange={setSelectedAgencies}
      />
    </>
  )
};