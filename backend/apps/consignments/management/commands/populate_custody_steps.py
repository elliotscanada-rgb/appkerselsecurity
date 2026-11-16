"""
Management command to populate custody steps for existing consignments.
Run: python manage.py populate_custody_steps
"""

from django.core.management.base import BaseCommand
from apps.consignments.models import Consignment, CustodyStep
from django.utils import timezone


class Command(BaseCommand):
    help = 'Populate custody steps for all consignments'

    def handle(self, *args, **options):
        """Populate custody steps for consignments that don't have them."""
        
        # Default custody steps for gold consignments
        default_steps = [
            {
                'step_number': 1,
                'title': 'Deposit registered',
                'description': 'Deposit record created and consignment registered in system',
                'evidence_description': 'Deposit receipt and documentation',
                'status': 'completed',
            },
            {
                'step_number': 2,
                'title': 'Physical inspection',
                'description': 'Item received and physically inspected for authenticity and condition',
                'evidence_description': 'Weight and physical identification records',
                'status': 'completed',
            },
            {
                'step_number': 3,
                'title': 'Assay verification',
                'description': 'Assay and purity testing completed by independent laboratory',
                'evidence_description': 'Independent assay documentation and certificates',
                'status': 'completed',
            },
            {
                'step_number': 4,
                'title': 'Vault admission',
                'description': 'Item admitted to secure vault storage with receipt issued',
                'evidence_description': 'Vault receipt and custody confirmation document',
                'status': 'completed',
            },
            {
                'step_number': 5,
                'title': 'Ongoing custody',
                'description': 'Item maintained in secure storage with periodic inventory verification',
                'evidence_description': 'Periodic independent inventory confirmation',
                'status': 'completed',
            },
        ]

        # Get all consignments
        consignments = Consignment.objects.all()
        created_count = 0
        skipped_count = 0

        for consignment in consignments:
            # Check if consignment already has custody steps
            existing_steps = CustodyStep.objects.filter(consignment=consignment).count()
            
            if existing_steps > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f'Skipped {consignment.consignment_number} - already has {existing_steps} custody steps'
                    )
                )
                skipped_count += 1
                continue

            # Create custody steps
            try:
                for step_data in default_steps:
                    CustodyStep.objects.create(
                        consignment=consignment,
                        step_number=step_data['step_number'],
                        title=step_data['title'],
                        description=step_data['description'],
                        evidence_description=step_data['evidence_description'],
                        status=step_data['status'],
                        completion_date=timezone.now() if step_data['status'] == 'completed' else None,
                    )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created 5 custody steps for {consignment.consignment_number}'
                    )
                )
                created_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error creating custody steps for {consignment.consignment_number}: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Completed!\n'
                f'  Created: {created_count} consignments with custody steps\n'
                f'  Skipped: {skipped_count} consignments already configured'
            )
        )
