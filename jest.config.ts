import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  coverageDirectory: './coverage'
};
