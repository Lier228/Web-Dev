from rest_framework import serializers


class StatsFilterSerializer(serializers.Serializer):
    period = serializers.ChoiceField(choices=['week'])
