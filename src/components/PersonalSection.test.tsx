/**
 * Unit tests for PersonalSection component
 * Requirements: 1.1-1.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PersonalSection from './PersonalSection';
import { PersonalInfo } from '../types';

describe('PersonalSection', () => {
  const mockPersonalInfo: PersonalInfo = {
    id: 'personal-info',
    name: 'Michael Jan',
    tagline: 'Software Engineer & Travel Enthusiast',
    description: 'Passionate about building great software and exploring the world.',
    linkedInUrl: 'https://www.linkedin.com/in/michaeljan',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  /**
   * Test: Name field is displayed
   * Requirements: 1.1
   */
  it('should display the name field', () => {
    render(<PersonalSection personalInfo={mockPersonalInfo} />);
    
    const nameElement = screen.getByText('Michael Jan');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement.tagName).toBe('H1');
  });

  /**
   * Test: Tagline field is displayed
   * Requirements: 1.2
   */
  it('should display the tagline field', () => {
    render(<PersonalSection personalInfo={mockPersonalInfo} />);
    
    const taglineElement = screen.getByText('Software Engineer & Travel Enthusiast');
    expect(taglineElement).toBeInTheDocument();
  });

  /**
   * Test: Description field is displayed
   * Requirements: 1.3
   */
  it('should display the description field', () => {
    render(<PersonalSection personalInfo={mockPersonalInfo} />);
    
    const descriptionElement = screen.getByText('Passionate about building great software and exploring the world.');
    expect(descriptionElement).toBeInTheDocument();
  });

  /**
   * Test: LinkedIn link is displayed and clickable
   * Requirements: 1.4
   */
  it('should display a clickable LinkedIn link', () => {
    render(<PersonalSection personalInfo={mockPersonalInfo} />);
    
    const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedInLink).toBeInTheDocument();
    expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/michaeljan');
    expect(linkedInLink).toHaveAttribute('target', '_blank');
    expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  /**
   * Test: All fields are displayed together
   * Requirements: 1.1-1.4
   */
  it('should display all personal information fields', () => {
    render(<PersonalSection personalInfo={mockPersonalInfo} />);
    
    expect(screen.getByText('Michael Jan')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer & Travel Enthusiast')).toBeInTheDocument();
    expect(screen.getByText('Passionate about building great software and exploring the world.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
  });

  /**
   * Test: Component renders with different personal info
   */
  it('should render correctly with different personal information', () => {
    const differentInfo: PersonalInfo = {
      id: 'personal-info',
      name: 'Jane Doe',
      tagline: 'Designer & Creator',
      description: 'Creating beautiful experiences.',
      linkedInUrl: 'https://www.linkedin.com/in/janedoe',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    render(<PersonalSection personalInfo={differentInfo} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Designer & Creator')).toBeInTheDocument();
    expect(screen.getByText('Creating beautiful experiences.')).toBeInTheDocument();
    
    const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/janedoe');
  });

  /**
   * Test: Component has proper semantic structure
   */
  it('should use semantic HTML structure', () => {
    const { container } = render(<PersonalSection personalInfo={mockPersonalInfo} />);
    
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('personal-section');
  });
});
