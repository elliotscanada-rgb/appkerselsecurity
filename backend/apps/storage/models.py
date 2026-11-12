from django.db import models

class StorageFacility(models.Model):
    facility_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    capacity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'storage_facilities'
    
    def __str__(self):
        return self.facility_name

class StorageUnit(models.Model):
    facility = models.ForeignKey(StorageFacility, on_delete=models.CASCADE)
    unit_name = models.CharField(max_length=100)
    capacity = models.IntegerField()
    current_occupancy = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'storage_units'
