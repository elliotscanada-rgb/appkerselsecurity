#!/usr/bin/env python
"""Verify custody steps have been created."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.consignments.models import Consignment, CustodyStep

consignments = Consignment.objects.all()[:3]
print("\n=== CUSTODY STEPS VERIFICATION ===\n")

for c in consignments:
    steps = CustodyStep.objects.filter(consignment=c)
    print(f"✓ {c.consignment_number}:")
    print(f"  Total custody steps: {steps.count()}")
    for step in steps:
        print(f"  └─ Step {step.step_number}: {step.title} ({step.status})")
    print()

print("=== STATUS ===")
total_consignments = Consignment.objects.count()
total_steps = CustodyStep.objects.count()
print(f"✓ Total consignments: {total_consignments}")
print(f"✓ Total custody steps: {total_steps}")
print(f"✓ Average steps per consignment: {total_steps / total_consignments:.1f}")
