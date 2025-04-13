# Roofing Services Research

## Overview
This directory contains the data for roofing services in both residential and commercial categories.

## Generated Files
- **roofing_services.json**: Basic list of services with IDs and names 
- **roofing_services_detailed.json**: Comprehensive research data about each service

## Services Structure
The detailed service data includes:
- Service ID and name
- Category (residential or commercial)
- Research information (installation, variants, advantages, etc.)
- URL-friendly slug

## Service Naming Convention
All service names are kept concise (1-3 words) for easier navigation and display in the UI:
- Residential: Shingling, Guttering, Chimney, Skylights, etc.
- Commercial: Coatings, Built-Up, Metal Roof, Drainage, etc.

## URL Routing
The slugs are formatted to work with the application's routing system:
- Format: `{category}-{prefix}{id}-{service-name}`
- Example: `residential-r1-shingling` or `commercial-c2-built-up`
